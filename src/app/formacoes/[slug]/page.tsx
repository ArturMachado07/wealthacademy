import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses } from "@/data/courses";
import { whatsappLink } from "@/data/site";
import EnrollButton from "@/components/EnrollButton";
import PaymentButton from "@/components/PaymentButton";
import MediaSlot from "@/components/MediaSlot";
import CourseCard from "@/components/CourseCard";
import CourseJsonLd from "@/components/CourseJsonLd";
import { CheckIcon, CheckCircleIcon } from "@/components/icons";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";
import { getInstructorsByCourse } from "@/lib/instructors";

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

  // Formadores geridos pelo Admin (com foto e link para /formadores/[slug]).
  // Se ainda não houver nenhum ligado na BD, mantém a lista estática de
  // src/data/courses.ts como recurso (sem foto/link) para não fazer a
  // secção desaparecer antes da migração ser corrida.
  const dbInstructors = await getInstructorsByCourse(course.slug);

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

  // Logística e datas ficam junto à descrição, no corpo principal (mais
  // visível do que escondidas no cartão lateral). O cartão lateral guarda
  // só a informação mais "comercial" (modalidade, formador, vagas).
  const allCourseDetails: [string, string | undefined][] = [
    ["Carga Horária", course.duration],
    ["Admissão", course.admission],
    ["Data", course.date],
    ["Local", course.location],
    ["Certificação", course.certification],
    ["Inclui", course.extras && course.extras.length > 0 ? course.extras.join(" · ") : undefined],
  ];
  const courseDetails = allCourseDetails.filter(([, value]) => Boolean(value));

  const allInclusions: [string, string | undefined][] = [
    ["Modalidade", course.modality],
    ["Formador", course.instructor],
    ["Vagas", course.seats],
  ];
  const inclusions = allInclusions.filter(([, value]) => Boolean(value));

  const relatedCourses = courses
    .filter((c) => c.slug !== course.slug && c.category === course.category)
    .slice(0, 3)
    .map((c) => applyCourseOverride(c, overrides.get(c.slug)));

  return (
    <article className="py-24">
      <CourseJsonLd course={course} />
      <div className="container-page">
        <nav className="text-sm text-ink-soft">
          <Link href="/formacoes" className="hover:text-gold-dark">
            Formações
          </Link>{" "}
          <span aria-hidden="true">/</span> <span className="text-ink">{course.title}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="max-w-2xl">
            <p className="eyebrow">{course.category}</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">{course.title}</h1>
            {course.description && (
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">{course.description}</p>
            )}

            {/* Em mobile a imagem aparece aqui, entre a descrição e a
                informação — no cartão lateral (que só existe visualmente a
                partir do desktop) a mesma imagem fica escondida. */}
            <div className="mt-6 overflow-hidden rounded border border-ink/10 lg:hidden">
              <MediaSlot
                baseName={course.image ?? course.slug}
                alt={course.title}
                className="aspect-[16/10] w-full"
                sizes="100vw"
              />
            </div>

            {courseDetails.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-ink/10 py-6 sm:grid-cols-3">
                {courseDetails.map(([label, value]) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <dt className="text-xs uppercase tracking-wide2 text-ink-soft">{label}</dt>
                      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}

            {course.modules && course.modules.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-medium text-ink">O que vai aprender</h2>
                <div className="mt-4 space-y-5">
                  {course.modules.map((item) => (
                    <div key={item.title}>
                      <p className="font-medium text-ink">{item.title}</p>
                      <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dbInstructors.length > 0 ? (
              <div className="mt-10">
                <h2 className="text-xl font-medium text-ink">Formadores</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {dbInstructors.map((person) => (
                    <Link
                      key={person.slug}
                      href={`/formadores/${person.slug}`}
                      className="group flex items-center gap-4 rounded border border-ink/10 bg-white/60 p-4 transition-colors hover:border-gold"
                    >
                      <MediaSlot
                        baseName={person.photo ?? person.slug}
                        alt={person.name}
                        className="h-14 w-14 shrink-0 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-ink group-hover:text-gold-dark">{person.name}</p>
                        {person.role && <p className="mt-0.5 text-sm text-ink-soft">{person.role}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              course.instructors &&
              course.instructors.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-medium text-ink">Formadores</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {course.instructors.map((person) => (
                      <div key={person.name}>
                        <p className="font-medium text-ink">{person.name}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">{person.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {course.objectives && course.objectives.length > 0 && (
              <div className="mt-10 rounded border border-ink/10 bg-white/60 p-6">
                <h2 className="text-lg font-medium text-ink">O que vai aprender</h2>
                <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {course.objectives.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
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

            {course.audience && (
              <div className="mt-10">
                <h2 className="text-xl font-medium text-ink">Público-alvo</h2>
                <p className="mt-3 text-ink-soft">{course.audience}</p>
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
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded border border-ink/10 bg-white/60">
              <MediaSlot
                baseName={course.image ?? course.slug}
                alt={course.title}
                className="hidden aspect-[16/10] w-full lg:block"
                sizes="380px"
              />

              <div className="p-6">
                {course.investment && (
                  <div>
                    <p className="text-xs uppercase tracking-wide2 text-ink-soft">Investimento</p>
                    <p className="mt-1 text-3xl font-medium text-ink">{course.investment}</p>
                  </div>
                )}

                {existingEnrollment && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-block w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold-dark">
                      {existingEnrollment.status === "Concluída"
                        ? "Formação concluída"
                        : existingEnrollment.status === "Pendente"
                          ? "Pagamento pendente"
                          : "Já está inscrito"}
                    </span>
                    {(existingEnrollment.status === "Em curso" || existingEnrollment.status === "Concluída") && (
                      <Link
                        href={`/aluno/formacao/${course.slug}`}
                        className="text-sm font-medium text-gold-dark underline"
                      >
                        Aceder ao curso
                      </Link>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 [&_.btn-primary]:w-full [&_.btn-primary]:justify-center [&_.btn-secondary]:w-full [&_.btn-secondary]:justify-center">
                  {existingEnrollment?.status === "Pendente" ? (
                    <PaymentButton
                      courseSlug={course.slug}
                      courseTitle={course.title}
                      investment={course.investment ?? ""}
                    />
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

                {inclusions.length > 0 && (
                  <div className="mt-6 space-y-2.5 border-t border-ink/10 pt-6 text-sm">
                    {inclusions.map(([label, value]) => (
                      <div key={label} className="flex items-start gap-2 text-ink-soft">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        <span>
                          <span className="text-ink">{label}:</span> {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {relatedCourses.length > 0 && (
          <div className="mt-20 border-t border-ink/10 pt-16">
            <h2 className="text-2xl font-medium text-ink">Formações semelhantes</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCourses.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
