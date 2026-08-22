import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { recalcCourseProgress } from "@/lib/lms-progress";

type Answer = { questionId: string; optionId: string };

// Corrige uma tentativa de teste no servidor — o browser nunca recebe qual
// é a opção correcta (ver supabase/011_lms_quizzes.sql), só o quizId e as
// respostas escolhidas chegam aqui. Se o aluno passar, marca a aula como
// concluída e recalcula o progresso do curso, tal como a marcação manual.
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const quizId = body?.quizId;
  const answers: Answer[] = Array.isArray(body?.answers)
    ? body.answers.filter(
        (a: unknown): a is Answer =>
          Boolean(a) &&
          typeof (a as Answer).questionId === "string" &&
          typeof (a as Answer).optionId === "string"
      )
    : [];

  if (!quizId || answers.length === 0) {
    return NextResponse.json({ ok: false, error: "Respostas em falta." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Resolve a aula/curso a partir do quiz — nunca confiamos num courseSlug
  // vindo do browser para decidir o que fica marcado como concluído.
  const { data: quiz, error: quizError } = await admin
    .from("lesson_quizzes")
    .select("id, passing_score, lesson_id, lessons(id, module_id, course_modules(course_slug))")
    .eq("id", quizId)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ ok: false, error: "Teste não encontrado." }, { status: 404 });
  }

  const lessonData = Array.isArray(quiz.lessons) ? quiz.lessons[0] : quiz.lessons;
  const moduleData = lessonData
    ? Array.isArray(lessonData.course_modules)
      ? lessonData.course_modules[0]
      : lessonData.course_modules
    : null;
  const courseSlug = moduleData?.course_slug;

  if (!courseSlug) {
    return NextResponse.json({ ok: false, error: "Formação não encontrada." }, { status: 404 });
  }

  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id, status")
    .eq("student_id", student.id)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (!enrollment || !["Em curso", "Concluída"].includes(enrollment.status)) {
    return NextResponse.json({ ok: false, error: "not_enrolled" }, { status: 403 });
  }

  // Busca as perguntas e a opção correcta de cada uma — só aqui, no
  // servidor, é que o is_correct chega a ser lido.
  const { data: questions } = await admin
    .from("quiz_questions")
    .select("id, quiz_options(id, is_correct)")
    .eq("quiz_id", quizId);

  const questionRows = questions ?? [];
  if (questionRows.length === 0) {
    return NextResponse.json({ ok: false, error: "Este teste ainda não tem perguntas." }, { status: 400 });
  }

  let correctCount = 0;
  for (const q of questionRows) {
    const options = Array.isArray(q.quiz_options) ? q.quiz_options : [];
    const correctOption = options.find((o) => o.is_correct);
    const submitted = answers.find((a) => a.questionId === q.id);
    if (correctOption && submitted && submitted.optionId === correctOption.id) {
      correctCount += 1;
    }
  }

  const score = Math.round((correctCount / questionRows.length) * 100);
  const passed = score >= quiz.passing_score;

  // Insere a tentativa através do cliente com RLS (não o service role) — a
  // policy "Aluno regista a própria tentativa" garante que só se consegue
  // gravar com o próprio student_id, mesmo que este endpoint tivesse um bug.
  const rlsClient = await createSupabaseServerClient();
  const { error: attemptError } = await rlsClient
    .from("quiz_attempts")
    .insert({ student_id: student.id, quiz_id: quizId, score, passed });

  if (attemptError) {
    console.error("[aluno/quiz-attempt] falha ao gravar tentativa:", attemptError);
    return NextResponse.json({ ok: false, error: "Não foi possível gravar o resultado." }, { status: 500 });
  }

  let progress = null;
  if (passed) {
    await admin
      .from("lesson_progress")
      .upsert(
        { student_id: student.id, lesson_id: quiz.lesson_id },
        { onConflict: "student_id,lesson_id" }
      );
    progress = await recalcCourseProgress(admin, student.id, courseSlug);
  }

  return NextResponse.json({
    ok: true,
    score,
    passed,
    correctCount,
    totalQuestions: questionRows.length,
    passingScore: quiz.passing_score,
    progress,
  });
}
