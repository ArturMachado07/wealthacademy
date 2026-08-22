import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";
import QuizPassingScoreForm from "@/components/admin/QuizPassingScoreForm";
import AddQuizQuestionForm from "@/components/admin/AddQuizQuestionForm";
import DeleteQuizQuestionButton from "@/components/admin/DeleteQuizQuestionButton";

export const metadata: Metadata = { title: "Teste da aula" };
export const dynamic = "force-dynamic";

type Option = { id: string; option_text: string; is_correct: boolean; position: number };
type Question = { id: string; question: string; position: number; quiz_options: Option[] };

export default async function AdminQuizPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { slug, lessonId } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const supabase = createSupabaseAdminClient();

  const { data: lesson } = await supabase.from("lessons").select("id, title").eq("id", lessonId).maybeSingle();
  if (!lesson) notFound();

  // Garante que existe sempre um teste para esta aula ao abrir a página —
  // evita um passo extra de "criar teste" antes de poder adicionar perguntas.
  const { data: quiz } = await supabase
    .from("lesson_quizzes")
    .upsert({ lesson_id: lessonId }, { onConflict: "lesson_id", ignoreDuplicates: true })
    .select("id, passing_score")
    .maybeSingle();

  const quizRow =
    quiz ??
    (await supabase.from("lesson_quizzes").select("id, passing_score").eq("lesson_id", lessonId).single()).data;

  if (!quizRow) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, question, position, quiz_options(id, option_text, is_correct, position)")
    .eq("quiz_id", quizRow.id)
    .order("position", { ascending: true });

  const questionRows = ((questions ?? []) as Question[]).map((q) => ({
    ...q,
    quiz_options: [...(q.quiz_options ?? [])].sort((a, b) => a.position - b.position),
  }));

  return (
    <section className="py-16">
      <div className="container-page max-w-2xl">
        <Link href={`/admin/formacoes/${slug}`} className="text-sm text-ink-soft underline">
          ← {course.title}
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Teste da aula</p>
          <h1 className="mt-2 font-display text-2xl text-ink">{lesson.title}</h1>
        </div>

        <div className="mt-8 rounded border border-ink/10 bg-white/60 p-6">
          <QuizPassingScoreForm lessonId={lessonId} initialPassingScore={quizRow.passing_score} />
        </div>

        <div className="mt-8 space-y-4">
          {questionRows.length === 0 && (
            <p className="text-sm text-ink-soft">
              Ainda não há perguntas — enquanto não houver nenhuma, a aula continua a poder ser marcada
              manualmente pelo aluno.
            </p>
          )}
          {questionRows.map((q, i) => (
            <div key={q.id} className="rounded border border-ink/10 bg-white/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-ink">
                  {i + 1}. {q.question}
                </p>
                <DeleteQuizQuestionButton questionId={q.id} />
              </div>
              <ul className="mt-3 space-y-1.5">
                {q.quiz_options.map((opt) => (
                  <li
                    key={opt.id}
                    className={`text-sm ${opt.is_correct ? "font-medium text-gold-dark" : "text-ink-soft"}`}
                  >
                    {opt.is_correct ? "✓ " : "· "}
                    {opt.option_text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded border border-dashed border-ink/20 p-5">
          <AddQuizQuestionForm quizId={quizRow.id} nextPosition={questionRows.length} />
        </div>
      </div>
    </section>
  );
}
