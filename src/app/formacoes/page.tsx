import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import { courses } from "@/data/courses";
import { trainingCategories } from "@/data/categories";

export const metadata: Metadata = {
  title: "Formações",
  description:
    "Cursos e programas de formação em Finanças e Negócios da Wealth Academy, alinhados às exigências do mercado angolano.",
};

export default function FormacoesPage() {
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Formações"
          title="Aprenda. Desenvolva. Distinga-se."
          description="Cursos e programas organizados por áreas de conhecimento. Categorias e formações são actualizadas continuamente."
        />

        <div className="mt-10 flex flex-wrap gap-3">
          {trainingCategories.map((category) => (
            <span key={category} className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink">
              {category}
            </span>
          ))}
        </div>

        <div className="mt-14">
          {courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Formações a serem publicadas em breve"
              description="Estamos a preparar o catálogo de cursos. Contacte-nos para saber mais sobre as próximas formações."
            />
          )}
        </div>
      </div>
    </section>
  );
}
