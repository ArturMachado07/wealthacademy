import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import CourseCard from "@/components/CourseCard";
import CoursesList from "@/components/CoursesList";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";

export const metadata: Metadata = {
  title: "Formações",
  description:
    "Cursos e programas de formação em Finanças e Negócios da Wealth Academy, alinhados às exigências do mercado angolano.",
};

export const dynamic = "force-dynamic";

export default async function FormacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const overrides = await getCourseOverrides();
  const coursesWithPricing = courses.map((course) => applyCourseOverride(course, overrides.get(course.slug)));

  // CourseCard usa MediaSlot (leitura de ficheiros no servidor) — é
  // renderizado aqui, no servidor, e só o nó já pronto é passado ao
  // componente de busca/filtro no cliente.
  const items = coursesWithPricing.map((course) => ({
    slug: course.slug,
    category: course.category,
    title: course.title,
    description: course.description,
    node: <CourseCard course={course} />,
  }));

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Formações"
          title="Aprenda. Desenvolva. Distinga-se."
          description="Cursos e programas organizados por áreas de conhecimento. Categorias e formações são actualizadas continuamente."
        />

        <div className="mt-10">
          <CoursesList items={items} initialCategory={categoria} />
        </div>
      </div>
    </section>
  );
}
