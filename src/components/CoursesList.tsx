"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { staggerDelay } from "@/lib/reveal";
import type { Course } from "@/data/courses";
import { trainingCategories } from "@/data/categories";

type Props = {
  courses: Course[];
  initialCategory?: string;
};

export default function CoursesList({ courses, initialCategory }: Props) {
  const [active, setActive] = useState<string>(
    initialCategory && (trainingCategories as readonly string[]).includes(initialCategory)
      ? initialCategory
      : "Todos"
  );

  const filtered = useMemo(() => {
    if (active === "Todos") return courses;
    return courses.filter((course) => course.category === active);
  }, [active, courses]);

  const filters = ["Todos", ...trainingCategories];

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              active === filter
                ? "border-gold bg-gold text-cream"
                : "border-ink/15 text-ink hover:border-gold"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-14">
        {filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => (
              <Reveal key={course.slug} as="div" delay={staggerDelay(i)}>
                <CourseCard course={course} />
              </Reveal>
            ))}
          </div>
        ) : active === "Todos" ? (
          <EmptyState
            title="Formações a serem publicadas em breve"
            description="Estamos a preparar o catálogo de cursos. Contacte-nos para saber mais sobre as próximas formações."
          />
        ) : (
          <EmptyState
            title="Sem formações nesta categoria"
            description="Novas formações são anunciadas periodicamente. Contacte-nos para saber mais."
          />
        )}
      </div>
    </div>
  );
}
