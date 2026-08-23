import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstructorBySlug, getCoursesByInstructor } from "@/lib/instructors";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import MediaSlot from "@/components/MediaSlot";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const instructor = await getInstructorBySlug(slug);
  if (!instructor) return { title: "Formador" };
  return {
    title: instructor.name,
    description: instructor.bio ?? `${instructor.name}, formador na Wealth Academy.`,
  };
}

export default async function InstructorPage({ params }: Props) {
  const { slug } = await params;
  const instructor = await getInstructorBySlug(slug);
  if (!instructor) notFound();

  const instructorCourses = await getCoursesByInstructor(instructor.slug);
  const bioParagraphs = instructor.bio
    ? instructor.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-center gap-6">
          <MediaSlot
            baseName={instructor.photo ?? instructor.slug}
            alt={instructor.name}
            className="h-24 w-24 shrink-0 rounded-full"
          />
          <div>
            <p className="eyebrow">Formador</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">{instructor.name}</h1>
            {instructor.role && (
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{instructor.role}</p>
            )}
          </div>
        </div>

        {bioParagraphs.length > 0 && (
          <div className="mt-6 space-y-4 text-justify text-ink-soft">
            {bioParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        <div className="mt-14">
          <h2 className="text-lg font-medium text-ink">Formações</h2>
          {instructorCourses.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {instructorCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Ainda sem formações associadas"
                description="As formações deste formador vão aparecer aqui assim que forem associadas."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
