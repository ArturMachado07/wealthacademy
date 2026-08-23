import Link from "next/link";
import type { Course } from "@/data/courses";
import { excerpt } from "@/lib/text";
import MediaSlot from "@/components/MediaSlot";

export default function CourseCard({ course }: { course: Course }) {
  const isOpen = course.status === "Inscrições abertas";

  return (
    <Link
      href={`/formacoes/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded border border-ink/10 bg-white/60 transition-colors hover:border-gold"
    >
      <MediaSlot
        baseName={course.image ?? course.slug}
        alt={course.title}
        className="aspect-[16/10] w-full"
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">
            {course.modality ?? course.category}
          </span>
          {!isOpen && (
            <span className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink-soft">
              {course.status}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-lg font-medium text-ink">{course.title}</h3>

        {course.description && (
          <p className="mt-2 flex-1 text-sm text-ink-soft">{excerpt(course.description, 90)}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {course.duration && <span>{course.duration}</span>}
          {course.date && <span>{course.date}</span>}
        </div>

        {course.investment && (
          <p className="mt-4 text-2xl font-medium text-ink">{course.investment}</p>
        )}

        <span className="btn mt-5 w-full bg-gold text-center text-cream group-hover:bg-gold-dark">
          Ver detalhes
        </span>
      </div>
    </Link>
  );
}
