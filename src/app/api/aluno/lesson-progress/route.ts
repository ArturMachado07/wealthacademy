import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Marca/desmarca uma aula como concluída para o aluno autenticado, e
// recalcula automaticamente o progress_percent da inscrição correspondente
// (aulas concluídas / total de aulas do curso).
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = body?.lessonId;
  const completed = Boolean(body?.completed);

  if (!lessonId) {
    return NextResponse.json({ ok: false, error: "Aula em falta." }, { status: 400 });
  }

  // Usa a service role só para consultas entre tabelas (course_slug da
  // aula) — a segurança real de quem pode marcar o quê já está garantida
  // pelo facto de só inserirmos/removermos linhas com este student_id, e
  // pela RLS de leitura de lessons/course_modules (o aluno já teria de
  // estar inscrito para sequer ver o lessonId).
  const supabase = createSupabaseAdminClient();

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, module_id, course_modules(course_slug)")
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ ok: false, error: "Aula não encontrada." }, { status: 404 });
  }

  const moduleData = Array.isArray(lesson.course_modules)
    ? lesson.course_modules[0]
    : lesson.course_modules;
  const courseSlug = moduleData?.course_slug;

  if (!courseSlug) {
    return NextResponse.json({ ok: false, error: "Curso não encontrado." }, { status: 404 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", student.id)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (!enrollment || !["Em curso", "Concluída"].includes(enrollment.status)) {
    return NextResponse.json({ ok: false, error: "not_enrolled" }, { status: 403 });
  }

  if (completed) {
    const { error: insertError } = await supabase
      .from("lesson_progress")
      .upsert(
        { student_id: student.id, lesson_id: lessonId },
        { onConflict: "student_id,lesson_id" }
      );
    if (insertError) {
      console.error("[lesson-progress] falha ao marcar concluída:", insertError);
      return NextResponse.json({ ok: false, error: "Não foi possível guardar." }, { status: 500 });
    }
  } else {
    const { error: deleteError } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("student_id", student.id)
      .eq("lesson_id", lessonId);
    if (deleteError) {
      console.error("[lesson-progress] falha ao desmarcar:", deleteError);
      return NextResponse.json({ ok: false, error: "Não foi possível guardar." }, { status: 500 });
    }
  }

  // Recalcula o progresso: total de aulas do curso vs. aulas concluídas
  // pelo aluno nesse curso.
  const { data: courseModules } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_slug", courseSlug);

  const moduleIds = (courseModules ?? []).map((m) => m.id);

  let totalLessons = 0;
  let completedLessons = 0;

  if (moduleIds.length > 0) {
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    const lessonIds = (allLessons ?? []).map((l) => l.id);
    totalLessons = lessonIds.length;

    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("student_id", student.id)
        .in("lesson_id", lessonIds);
      completedLessons = count ?? 0;
    }
  }

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Não mexe no estado "Concluída" — isso continua a ser uma decisão do
  // Admin (emite certificado), mesmo que o progresso chegue a 100%.
  if (enrollment.status !== "Concluída") {
    await supabase
      .from("enrollments")
      .update({ progress_percent: progressPercent, updated_at: new Date().toISOString() })
      .eq("id", enrollment.id);
  }

  return NextResponse.json({ ok: true, progressPercent, completedLessons, totalLessons });
}
