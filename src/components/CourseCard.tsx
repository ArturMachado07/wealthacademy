import Link from "next/link";
import type { Course } from "@/data/courses";
import { excerpt } from "@/lib/text";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/formacoes/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded border border-ink/10 bg-white/60 transition-colors hover:border-gold"
    >
      <div className="aspect-[4/3] w-full bg-ink/5" aria-hidden="true" />
      <div className="flex flex-1 flex-col p-6">
        <span className="eyebrow">{course.category}</span>
        <h3 className="mt-2 text-lg font-medium text-ink">{course.title}</h3>
        {course.description && (
          <p className="mt-2 flex-1 text-sm text-ink-soft">{excerpt(course.description)}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {course.modality && <span>{course.modality}</span>}
          {course.duration && <span>{course.duration}</span>}
          {course.date && <span>{course.date}</span>}
        </div>
        {course.investment && (
          <p className="mt-3 text-sm text-ink">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Investimento</span>{" "}
            <span className="font-medium">{course.investment}</span>
          </p>
        )}
        <span className="mt-4 text-sm font-medium text-gold group-hover:underline">
          {course.status === "Inscrições abertas" ? "Explorar formação" : course.status}
        </span>
      </div>
    </Link>
  );
}
