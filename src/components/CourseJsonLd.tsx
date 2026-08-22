import { siteConfig } from "@/data/site";
import type { Course } from "@/data/courses";

// Dados estruturados schema.org/Course — ajuda o Google a mostrar
// resultados mais ricos para as páginas de formação. Não inclui preço:
// os valores actuais em "investment" são demo/temporários (ver
// src/data/courses.ts) e não devem aparecer como dado oficial no Google
// antes de serem os preços reais.
export default function CourseJsonLd({ course }: { course: Course }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description ?? course.title,
    provider: {
      "@type": "EducationalOrganization",
      name: siteConfig.name,
      sameAs: process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao",
    },
    ...(course.instructor
      ? {
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: course.modality === "Online" ? "online" : "onsite",
            instructor: {
              "@type": "Person",
              name: course.instructor,
            },
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
