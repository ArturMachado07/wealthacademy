import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import ToggleLessonButton from "@/components/aluno/ToggleLessonButton";
import QuizForm from "@/components/aluno/QuizForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Aula" };

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_provider: "youtube" | "vimeo" | "direct";
  video_url: string | null;
  materials_url: string | null;
  duration_minutes: number | null;
  position: number;
  module_id: string;
};

type ModuleRow = {
  id: string;
  position: number;
  lessons: Lesson[];
};

export default async function AlunoLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const student = await getCurrentStudent();

  if (!student) {
    redirect(`/aluno/login?from=/aluno/formacao/${slug}/${lessonId}`);
  }

  const supabase = await createSupabaseServerClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, course_title, status")
    .eq("student_id", student.id)
    .eq("course_slug", slug)
    .maybeSingle();

  if (!enrollment || !["Em curso", "Concluída"].includes(enrollment.status)) {
    notFound();
  }

  // Vai buscar todos os módulos/aulas do curso para saber a ordem
  // (navegação anterior/seguinte) e confirmar que esta aula pertence a
  // este curso.
  const { data: modules } = await supabase
    .from("course_modules")
    .select(
      "id, position, lessons(id, title, description, video_provider, video_url, materials_url, duration_minutes, position, module_id)"
    )
    .eq("course_slug", slug)
    .order("position", { ascending: true });

  const moduleRows = ((modules ?? []) as ModuleRow[])
    .map((m) => ({ ...m, lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position) }))
    .sort((a, b) => a.position - b.position);

  const orderedLessons = moduleRows.flatMap((m) => m.lessons);
  const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);
  const lesson = orderedLessons[currentIndex];

  if (!lesson) {
    notFound();
  }

  const previousLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null;

  const { data: progressRow } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("student_id", student.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  // O teste (se existir) é lido pelo service role, porque só assim
  // conseguimos excluir o campo is_correct do que é enviado ao browser —
  // com RLS normal não há como esconder uma coluna, só linhas inteiras.
  const admin = createSupabaseAdminClient();
  const { data: quiz } = await admin
    .from("lesson_quizzes")
    .select("id, questions:quiz_questions(id, question, position, options:quiz_options(id, option_text, position))")
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  let alreadyPassedQuiz = false;
  if (quiz) {
    const { data: passedAttempt } = await supabase
      .from("quiz_attempts")
      .select("id")
      .eq("student_id", student.id)
      .eq("quiz_id", quiz.id)
      .eq("passed", true)
      .maybeSingle();
    alreadyPassedQuiz = Boolean(passedAttempt);
  }

  const quizQuestions = quiz
    ? [...(quiz.questions ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((q) => ({
          id: q.id,
          question: q.question,
          options: [...(q.options ?? [])].sort((a, b) => a.position - b.position),
        }))
        .filter((q) => q.options.length > 0)
    : [];

  return (
    <section className="py-24">
      <div className="container-page max-w-3xl">
        <Link href={`/aluno/formacao/${slug}`} className="text-sm text-ink-soft underline">
          ← {enrollment.course_title}
        </Link>

        <h1 className="mt-4 font-display text-2xl text-ink">{lesson.title}</h1>

        <div className="mt-6 overflow-hidden rounded border border-ink/10 bg-ink/90">
          {lesson.video_url ? (
            lesson.video_provider === "direct" ? (
              <video controls className="aspect-video w-full" src={lesson.video_url} />
            ) : (
              <iframe
                src={lesson.video_url}
                className="aspect-video w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <div className="flex aspect-video w-full items-center justify-center text-sm text-cream/60">
              Vídeo em preparação.
            </div>
          )}
        </div>

        {lesson.description && (
          <p className="mt-6 text-sm leading-relaxed text-ink-soft">{lesson.description}</p>
        )}

        {lesson.materials_url && (
          <a
            href={lesson.materials_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-gold-dark underline"
          >
            Descarregar materiais desta aula
          </a>
        )}

        <div className="mt-8">
          {quiz && quizQuestions.length > 0 ? (
            <>
              <p className="mb-3 text-sm font-medium text-ink">Teste desta aula</p>
              <QuizForm quizId={quiz.id} questions={quizQuestions} alreadyPassed={alreadyPassedQuiz} />
            </>
          ) : (
            <ToggleLessonButton lessonId={lesson.id} initialCompleted={Boolean(progressRow)} />
          )}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6 text-sm">
          {previousLesson ? (
            <Link
              href={`/aluno/formacao/${slug}/${previousLesson.id}`}
              className="text-ink-soft underline"
            >
              ← {previousLesson.title}
            </Link>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Link href={`/aluno/formacao/${slug}/${nextLesson.id}`} className="text-ink-soft underline">
              {nextLesson.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </section>
  );
}
