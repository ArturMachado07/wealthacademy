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
import CourseContentForm from "@/components/admin/CourseContentForm";
import CourseInstructorsForm from "@/components/admin/CourseInstructorsForm";

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
  const [{ data: modules }, { data: pricing }, { data: instructors }, { data: courseInstructors }] =
    await Promise.all([
      supabase
        .from("course_modules")
        .select("id, title, position, lessons(id, title, duration_minutes, position)")
        .eq("course_slug", slug)
        .order("position", { ascending: true }),
      supabase
        .from("course_pricing")
        .select(
          "investment, date, title, description, duration, admission, location, certification, extras, image"
        )
        .eq("course_slug", slug)
        .maybeSingle(),
      supabase.from("instructors").select("slug, name, role").order("name"),
      supabase
        .from("course_instructors")
        .select("instructor_slug")
        .eq("course_slug", slug)
        .order("position", { ascending: true }),
    ]);

  const moduleRows = ((modules ?? []) as ModuleRow[]).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position),
  }));

  const instructorOptions = (instructors ?? []) as { slug: string; name: string; role: string | null }[];
  const linkedInstructorSlugs = ((courseInstructors ?? []) as { instructor_slug: string }[]).map(
    (row) => row.instructor_slug
  );

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

        <div className="mt-8 rounded border border-ink/10 bg-white/60 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">
            Conteúdo da página da formação
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            Título, descrição, informações e banner mostrados em /formacoes/{slug}. O programa (módulos) não é
            editável aqui.
          </p>
          <div className="mt-4">
            <CourseContentForm
              courseSlug={slug}
              initial={{
                title: pricing?.title ?? "",
                description: pricing?.description ?? "",
                duration: pricing?.duration ?? "",
                admission: pricing?.admission ?? "",
                date: pricing?.date ?? "",
                location: pricing?.location ?? "",
                certification: pricing?.certification ?? "",
                extras: pricing?.extras && pricing.extras.length > 0 ? pricing.extras.join("\n") : "",
                image: pricing?.image ?? "",
                investment: pricing?.investment ?? "",
              }}
              placeholders={{
                title: course.title,
                description: course.description ?? "",
                duration: course.duration ?? "",
                admission: course.admission ?? "",
                date: course.date ?? "",
                location: course.location ?? "",
                certification: course.certification ?? "",
                extras: course.extras && course.extras.length > 0 ? course.extras.join("\n") : "",
                image: course.image ?? "",
                investment: course.investment ?? "",
              }}
            />
          </div>
        </div>

        <div className="mt-8 rounded border border-ink/10 bg-white/60 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">Formadores desta formação</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Seleccione os formadores que aparecem na secção &quot;Formadores&quot; da página da formação.
          </p>
          <div className="mt-4">
            <CourseInstructorsForm
              courseSlug={slug}
              allInstructors={instructorOptions}
              linkedSlugs={linkedInstructorSlugs}
            />
          </div>
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
                        <Link
                          href={`/admin/formacoes/${slug}/testes/${lesson.id}`}
                          className="text-xs font-medium text-gold-dark underline"
                        >
                          Teste
                        </Link>
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
