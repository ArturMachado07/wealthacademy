import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Lesson = {
  id: string;
  title: string;
  duration_minutes: number | null;
  position: number;
};

type ModuleRow = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Curso — ${slug}` };
}

export default async function AlunoFormacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const student = await getCurrentStudent();

  if (!student) {
    redirect(`/aluno/login?from=/aluno/formacao/${slug}`);
  }

  const supabase = await createSupabaseServerClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, course_title, status, progress_percent")
    .eq("student_id", student.id)
    .eq("course_slug", slug)
    .maybeSingle();

  if (!enrollment || !["Em curso", "Concluída"].includes(enrollment.status)) {
    notFound();
  }

  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, position, lessons(id, title, duration_minutes, position)")
    .eq("course_slug", slug)
    .order("position", { ascending: true });

  const moduleRows = ((modules ?? []) as ModuleRow[]).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position),
  }));

  const allLessonIds = moduleRows.flatMap((m) => m.lessons.map((l) => l.id));

  let completedLessonIds = new Set<string>();
  if (allLessonIds.length > 0) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("student_id", student.id)
      .in("lesson_id", allLessonIds);
    completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));
  }

  const progress = enrollment.status === "Concluída" ? 100 : enrollment.progress_percent;

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/aluno" className="text-sm text-ink-soft underline">
          ← Voltar ao dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{enrollment.status}</p>
            <h1 className="mt-2 font-display text-3xl text-ink">{enrollment.course_title}</h1>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-soft">{progress}% concluído</p>

        <div className="mt-14">
          {moduleRows.length === 0 ? (
            <EmptyState
              eyebrow="Conteúdo em preparação"
              title="Ainda não há aulas publicadas"
              description="A equipa da Wealth Academy está a preparar o conteúdo desta formação. Volte em breve."
            />
          ) : (
            <div className="space-y-8">
              {moduleRows.map((moduleRow) => (
                <div key={moduleRow.id}>
                  <h2 className="text-lg font-medium text-ink">{moduleRow.title}</h2>
                  <div className="mt-3 divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
                    {moduleRow.lessons.map((lesson) => {
                      const done = completedLessonIds.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/aluno/formacao/${slug}/${lesson.id}`}
                          className="flex items-center justify-between gap-4 px-5 py-4 text-sm hover:bg-white"
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                done
                                  ? "border-gold bg-gold text-cream"
                                  : "border-ink/30 text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                            <span className="text-ink">{lesson.title}</span>
                          </span>
                          {lesson.duration_minutes && (
                            <span className="shrink-0 text-xs text-ink-soft">
                              {lesson.duration_minutes} min
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
