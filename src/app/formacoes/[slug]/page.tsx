import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses } from "@/data/courses";
import { siteConfig, whatsappLink } from "@/data/site";
import EnrollButton from "@/components/EnrollButton";
import PaymentButton from "@/components/PaymentButton";
import CourseSlideshow from "@/components/CourseSlideshow";
import CourseJsonLd from "@/components/CourseJsonLd";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findPublicImage } from "@/lib/media";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";

type Props = { params: { slug: string } };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function generateMetadata({ params }: Props): Metadata {
  const course = getCourse(params.slug);
  if (!course) return { title: "Formação" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const baseCourse = getCourse(params.slug);
  if (!baseCourse) notFound();

  const overrides = await getCourseOverrides();
  const course = applyCourseOverride(baseCourse, overrides.get(baseCourse.slug));

  // Aluno autenticado vê "Inscreva-se na sua conta" em vez do CTA comercial
  // "Quero inscrever-me" (que leva a Contactos, para quem ainda não é aluno).
  const student = await getCurrentStudent();

  // Se o aluno já tiver uma inscrição nesta formação, mostra o estado em vez
  // de repetir o botão de inscrição/pagamento — evita a confusão de ver
  // "Inscrever-me" outra vez numa formação já comprada.
  let existingEnrollment: { status: string } | null = null;
  if (student) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("enrollments")
      .select("status")
      .eq("student_id", student.id)
      .eq("course_slug", course.slug)
      .in("status", ["Pendente", "Em curso", "Concluída"])
      .order("enrolled_at", { ascending: false })
      .maybeSingle();
    existingEnrollment = data;
  }

  // Resolvido aqui (Server Component, pode usar fs) e passado como props
  // simples ao CourseSlideshow (client component, só para as setas).
  const slides = [
    { key: "capa", label: "Capa", src: findPublicImage(`curso-${course.slug}-1-capa`) },
    { key: "beneficios", label: "Benefícios", src: findPublicImage(`curso-${course.slug}-2-beneficios`) },
    { key: "formadores", label: "Formadores", src: findPublicImage(`curso-${course.slug}-3-formadores`) },
  ];

  const details: [string, string | undefined][] = [
    ["Modalidade", course.modality],
    ["Duração", course.duration],
    ["Acompanhamento", course.followUp],
    ["Data", course.date],
    ["Local", course.location],
    ["Formador", course.instructor],
    ["Investimento", course.investment],
    ["Certificação", course.certification],
    ["Vagas", course.seats],
  ];

  return (
    <article className="py-24">
      <CourseJsonLd course={course} />
      <div className="container-page max-w-3xl">
        <p className="eyebrow">{course.category}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">{course.title}</h1>
        {course.description && (
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{course.description}</p>
        )}

        <div className="mt-8 max-w-md">
          <CourseSlideshow title={course.title} slides={slides} />
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-ink/10 py-8 md:grid-cols-4">
          {details
            .filter(([, value]) => Boolean(value))
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide2 text-ink-soft">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
        </dl>

        {course.objectives && course.objectives.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-medium text-ink">Objectivos</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              {course.objectives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {course.audience && (
          <div className="mt-10">
            <h2 className="text-xl font-medium text-ink">Público-alvo</h2>
            <p className="mt-3 text-ink-soft">{course.audience}</p>
          </div>
        )}

        {course.syllabus && course.syllabus.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-medium text-ink">Conteúdos programáticos</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              {course.syllabus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {course.faq && course.faq.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-medium text-ink">Perguntas frequentes</h2>
            <div className="mt-3 space-y-4">
              {course.faq.map((item) => (
                <div key={item.question}>
                  <p className="font-medium text-ink">{item.question}</p>
                  <p className="mt-1 text-sm text-ink-soft">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {existingEnrollment && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="inline-block w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold-dark">
              {existingEnrollment.status === "Concluída"
                ? "Formação concluída"
                : existingEnrollment.status === "Pendente"
                  ? "Pagamento pendente"
                  : "Já está inscrito"}
            </span>
            {(existingEnrollment.status === "Em curso" || existingEnrollment.status === "Concluída") && (
              <Link href={`/aluno/formacao/${course.slug}`} className="text-sm font-medium text-gold-dark underline">
                Aceder ao curso
              </Link>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          {existingEnrollment?.status === "Pendente" ? (
            <PaymentButton courseSlug={course.slug} courseTitle={course.title} investment={course.investment ?? ""} />
          ) : existingEnrollment ? null : student ? (
            course.investment ? (
              <PaymentButton
                courseSlug={course.slug}
                courseTitle={course.title}
                investment={course.investment}
              />
            ) : (
              <EnrollButton courseSlug={course.slug} courseTitle={course.title} />
            )
          ) : (
            <Link href={`/aluno/registo?from=/formacoes/${course.slug}`} className="btn-primary">
              Quero inscrever-me
            </Link>
          )}
          <a
            href={whatsappLink(`Olá, gostaria de obter informações sobre a formação ${course.title}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Pedir mais informações
          </a>
        </div>
      </div>
    </article>
  );
}
