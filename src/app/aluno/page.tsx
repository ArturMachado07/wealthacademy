import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import NotificationBell from "@/components/aluno/NotificationBell";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import PaymentButton from "@/components/PaymentButton";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";
import { getWorkshops } from "@/lib/workshops";
import { whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "O meu Dashboard",
  description: "Área do Aluno — Wealth Academy.",
};
export const dynamic = "force-dynamic";

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
  enrollment_id: string | null;
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
      .select("id, enrollment_id, course_title, certificate_number, issue_date")
      .eq("student_id", student.id)
      .order("issue_date", { ascending: false }),
  ]);

  const activeEnrollments = (enrollments ?? []) as Enrollment[];
  const earnedCertificates = (certificates ?? []) as Certificate[];
  const overrides = await getCourseOverrides();

  const emCursoCount = activeEnrollments.filter((e) => e.status === "Em curso").length;
  const concluidasCount = activeEnrollments.filter((e) => e.status === "Concluída").length;

  // Só os próximos (não "Realizado") — teaser discreto para descobrir a
  // galeria de workshops sem sair do dashboard.
  const upcomingWorkshops = (await getWorkshops())
    .filter((w) => w.status !== "Realizado")
    .slice(0, 3);

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar url={student.avatar_url} name={student.name} size={64} />
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
                <Link href="/aluno/certificados" className="text-gold-dark underline">
                  Os meus certificados
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <SignOutButton />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded border border-ink/10 bg-white/60 p-6">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Em curso</p>
            <p className="mt-2 font-display text-3xl text-ink">{emCursoCount}</p>
          </div>
          <div className="rounded border border-ink/10 bg-white/60 p-6">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Concluídos</p>
            <p className="mt-2 font-display text-3xl text-ink">{concluidasCount}</p>
          </div>
          <div className="rounded border border-ink/10 bg-white/60 p-6">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Certificados</p>
            <p className="mt-2 font-display text-3xl text-ink">{earnedCertificates.length}</p>
          </div>
        </div>

        <div className="mt-10">
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
                  {enrollment.status === "Concluída" && (() => {
                    const certificate = earnedCertificates.find(
                      (c) => c.enrollment_id === enrollment.id
                    );
                    if (!certificate) return null;
                    return (
                      <Link
                        href={`/aluno/certificados/${certificate.certificate_number}`}
                        className="mt-2 block text-sm font-medium text-gold-dark underline"
                      >
                        Ver certificado
                      </Link>
                    );
                  })()}
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
                          studentName={student.name}
                          studentEmail={student.email}
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

        {upcomingWorkshops.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-medium text-ink">Próximos workshops</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingWorkshops.map((workshop) => (
                <Link
                  key={workshop.slug}
                  href={`/workshops/${workshop.slug}`}
                  className="rounded border border-ink/10 bg-white/60 p-4 transition-colors hover:border-gold"
                >
                  <p className="text-sm font-medium text-ink">{workshop.title}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {[workshop.date, workshop.location].filter(Boolean).join(" · ") || workshop.status}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 flex items-center gap-2 border-t border-ink/10 pt-6 text-sm text-ink-soft">
          <span>
            Precisa de ajuda?{" "}
            <a
              href={whatsappLink("Olá! Preciso de ajuda com a minha conta na Wealth Academy.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold-dark underline"
            >
              Fale connosco
            </a>
          </span>
        </div>

      </div>
    </section>
  );
}
