import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import EmptyState from "@/components/EmptyState";
import PaymentButton from "@/components/PaymentButton";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";

export const metadata: Metadata = {
  title: "O meu Dashboard",
  description: "Área do Aluno — Wealth Academy.",
};

type Enrollment = {
  id: string;
  course_slug: string;
  course_title: string;
  status: string;
  progress_percent: number;
  next_lesson: string | null;
};

type Certificate = {
  id: string;
  course_title: string;
  certificate_number: string;
  issue_date: string;
};

export default async function AlunoDashboardPage() {
  const student = await getCurrentStudent();

  // Sem sessão válida — manda para o login em vez de rebentar.
  if (!student) {
    redirect("/aluno/login");
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: enrollments }, { data: certificates }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, course_slug, course_title, status, progress_percent, next_lesson")
      .eq("student_id", student.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("certificates")
      .select("id, course_title, certificate_number, issue_date")
      .eq("student_id", student.id)
      .order("issue_date", { ascending: false }),
  ]);

  const activeEnrollments = (enrollments ?? []) as Enrollment[];
  const earnedCertificates = (certificates ?? []) as Certificate[];
  const overrides = await getCourseOverrides();

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Área do Aluno</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Olá, {student.name}</h1>
            <div className="mt-3 flex gap-4 text-sm">
              <Link href="/aluno/perfil" className="text-gold-dark underline">
                O meu perfil
              </Link>
              <Link href="/aluno/pagamentos" className="text-gold-dark underline">
                Os meus pagamentos
              </Link>
            </div>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-14">
          <h2 className="text-lg font-medium text-ink">Meus Cursos</h2>
          {activeEnrollments.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                eyebrow="Ainda sem inscrições"
                title="Ainda não tem formações activas"
                description="Assim que se inscrever numa formação, ela aparece aqui com o seu progresso."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {activeEnrollments.map((enrollment) => {
                const progress =
                  enrollment.status === "Concluída" ? 100 : enrollment.progress_percent;
                // O título guardado na inscrição é uma cópia do momento da
                // inscrição — se a formação for renomeada depois, mostramos
                // o título actual do catálogo (por slug) para não ficar
                // desactualizado, com o título guardado só como reserva
                // (ex.: formação entretanto removida do catálogo).
                const courseTitle =
                  courses.find((c) => c.slug === enrollment.course_slug)?.title ?? enrollment.course_title;
                return (
                <div key={enrollment.id} className="rounded border border-ink/10 bg-white/60 p-6">
                  <p className="text-xs uppercase tracking-wide text-ink-soft">{enrollment.status}</p>
                  <h3 className="mt-1 text-lg font-medium text-ink">{courseTitle}</h3>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">{progress}% concluído</p>
                  {enrollment.next_lesson && (
                    <p className="mt-3 text-sm text-ink-soft">
                      Próxima aula: <span className="text-ink">{enrollment.next_lesson}</span>
                    </p>
                  )}
                  {(enrollment.status === "Em curso" || enrollment.status === "Concluída") && (
                    <Link
                      href={`/aluno/formacao/${enrollment.course_slug}`}
                      className="mt-4 inline-block text-sm font-medium text-gold-dark underline"
                    >
                      Aceder ao curso
                    </Link>
                  )}
                  {enrollment.status === "Pendente" && (() => {
                    const course = courses.find((c) => c.slug === enrollment.course_slug);
                    const priced = course ? applyCourseOverride(course, overrides.get(course.slug)) : null;
                    if (!priced?.investment) return null;
                    return (
                      <div className="mt-4">
                        <p className="mb-2 text-xs text-ink-soft">
                          A inscrição fica confirmada assim que o pagamento for concluído.
                        </p>
                        <PaymentButton
                          courseSlug={enrollment.course_slug}
                          courseTitle={course?.title ?? enrollment.course_title}
                          investment={priced.investment}
                        />
                      </div>
                    );
                  })()}
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-14">
          <h2 className="text-lg font-medium text-ink">Certificados</h2>
          {earnedCertificates.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                eyebrow="Ainda sem certificados"
                title="Ainda não tem certificados emitidos"
                description="Os certificados das formações concluídas aparecem aqui, com número único e validação por QR code."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {earnedCertificates.map((certificate) => (
                <div key={certificate.id} className="rounded border border-ink/10 bg-white/60 p-6">
                  <h3 className="text-lg font-medium text-ink">{certificate.course_title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">Nº {certificate.certificate_number}</p>
                  <p className="mt-1 text-xs text-ink-soft/70">
                    Emitido em {new Date(certificate.issue_date).toLocaleDateString("pt-PT")}
                  </p>
                  <Link
                    href={`/validar/${certificate.certificate_number}`}
                    className="mt-3 inline-block text-sm text-gold-dark underline"
                  >
                    Ver validação pública
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
