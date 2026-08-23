import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstructorBySlug, getCoursesByInstructor } from "@/lib/instructors";
import CourseCard from "@/components/CourseCard";
import SectionHeading from "@/components/SectionHeading";
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

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-center gap-6">
          <MediaSlot
            baseName={instructor.photo ?? instructor.slug}
            alt={instructor.name}
            className="h-24 w-24 shrink-0 rounded-full"
          />
          <SectionHeading eyebrow="Formador" title={instructor.name} description={instructor.role ?? undefined} />
        </div>

        {instructor.bio && <p className="mt-6 max-w-2xl text-ink-soft">{instructor.bio}</p>}

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
