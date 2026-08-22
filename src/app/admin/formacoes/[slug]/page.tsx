import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";
import AddModuleForm from "@/components/admin/AddModuleForm";
import AddLessonForm from "@/components/admin/AddLessonForm";
import DeleteModuleButton from "@/components/admin/DeleteModuleButton";
import DeleteLessonButton from "@/components/admin/DeleteLessonButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  return { title: course ? `${course.title} — Conteúdo` : "Conteúdo da formação" };
}

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

export default async function AdminFormacaoContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, position, lessons(id, title, duration_minutes, position)")
    .eq("course_slug", slug)
    .order("position", { ascending: true });

  const moduleRows = ((modules ?? []) as ModuleRow[]).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position),
  }));

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin/formacoes" className="text-sm text-ink-soft underline">
          ← Formações
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Conteúdo do LMS</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{course.title}</h1>
        </div>

        <div className="mt-10 space-y-8">
          {moduleRows.map((moduleRow) => (
            <div key={moduleRow.id} className="rounded border border-ink/10 bg-white/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-ink">{moduleRow.title}</h2>
                <DeleteModuleButton moduleId={moduleRow.id} />
              </div>

              {moduleRow.lessons.length > 0 && (
                <div className="mt-4 divide-y divide-ink/10 rounded border border-ink/10 bg-cream/40">
                  {moduleRow.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="text-ink">{lesson.title}</span>
                      <span className="flex items-center gap-4">
                        {lesson.duration_minutes && (
                          <span className="text-xs text-ink-soft">{lesson.duration_minutes} min</span>
                        )}
                        <DeleteLessonButton lessonId={lesson.id} />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <AddLessonForm moduleId={moduleRow.id} nextPosition={moduleRow.lessons.length} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded border border-dashed border-ink/20 p-6">
          <AddModuleForm courseSlug={slug} nextPosition={moduleRows.length} />
        </div>
      </div>
    </section>
  );
}
