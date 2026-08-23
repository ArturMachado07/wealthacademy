import Link from "next/link";
import { trainingCategories } from "@/data/categories";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";
import CourseCard from "@/components/CourseCard";
import Reveal from "@/components/Reveal";
import { staggerDelay } from "@/lib/reveal";

// As 3 formações em destaque na home — Controlo Financeiro Pessoal, Fast
// Track Investidores e Análise e Negociação no Mercado de Capitais.
const FEATURED_SLUGS = ["controlo-financeiro-pessoal", "fast-track-investidores", "analise-negociacao-mercado-capitais"];

export default async function TrainingSection() {
  const overrides = await getCourseOverrides();
  const featuredCourses = FEATURED_SLUGS.map((slug) => courses.find((course) => course.slug === slug))
    .filter((course): course is NonNullable<typeof course> => Boolean(course))
    .map((course) => applyCourseOverride(course, overrides.get(course.slug)));

  return (
    <section className="bg-white/50 py-24">
      <div className="container-page">
        <Reveal as="div" className="max-w-2xl">
          <p className="eyebrow">Formação</p>
          <h2 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">
            Aprenda. Desenvolva. Distinga-se.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {featuredCourses.map((course, i) => (
            <Reveal key={course.slug} as="div" delay={staggerDelay(i)}>
              <CourseCard course={course} />
            </Reveal>
          ))}
        </div>

        <Reveal as="div" className="mt-14 flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-soft">Áreas de formação:</span>
          {trainingCategories.map((category) => (
            <Link
              key={category}
              href={`/formacoes?categoria=${encodeURIComponent(category)}`}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink transition-colors hover:border-gold"
            >
              {category}
            </Link>
          ))}
        </Reveal>

        <div className="mt-10">
          <Link href="/formacoes" className="btn-secondary">
            Explorar Formações
          </Link>
        </div>
      </div>
    </section>
  );
}
