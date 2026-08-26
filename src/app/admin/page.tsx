import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import ConcluirInscricaoButton from "@/components/admin/ConcluirInscricaoButton";
import CertificateUploadForm from "@/components/admin/CertificateUploadForm";
import LeadTableRow from "@/components/admin/LeadTableRow";
import AdminNotificationBell from "@/components/admin/NotificationBell";
import { UsersIcon, UserPlusIcon, CoinIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Painel Admin" };
export const dynamic = "force-dynamic";

type EnrollmentRow = {
  id: string;
  course_title: string;
  status: string;
  progress_percent: number;
  enrolled_at: string;
  students: { name: string; email: string } | { name: string; email: string }[] | null;
};

type CertificateRow = { enrollment_id: string | null; certificate_number: string; file_path: string | null };

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  origin: string;
  status: string;
  created_at: string;
  company: string | null;
  role: string | null;
  participants: string | null;
  training_need: string | null;
  preferred_modality: string | null;
  message: string | null;
};

function studentOf(row: EnrollmentRow) {
  return Array.isArray(row.students) ? row.students[0] : row.students;
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  // Usa a service role — o Admin precisa de ver dados de todos os alunos,
  // o que o RLS (pensado para cada aluno só ver o seu próprio) não permite
  // com a chave pública.
  const supabase = createSupabaseAdminClient();

  const [{ data: enrollments }, { data: leads }, { data: payments }, { data: certificates }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, course_title, status, progress_percent, enrolled_at, students(name, email)")
      .order("enrolled_at", { ascending: false }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("amount, currency, status"),
    supabase.from("certificates").select("enrollment_id, certificate_number, file_path"),
  ]);

  const enrollmentRows = (enrollments ?? []) as EnrollmentRow[];
  const leadRows = (leads ?? []) as LeadRow[];
  const certificateByEnrollment = new Map(
    ((certificates ?? []) as CertificateRow[])
      .filter((c) => c.enrollment_id)
      .map((c) => [c.enrollment_id as string, c])
  );
  const paymentRows = (payments ?? []) as { amount: number; currency: string; status: string }[];

  const revenueByCurrency = new Map<string, number>();
  for (const p of paymentRows) {
    if (p.status !== "accepted") continue;
    revenueByCurrency.set(p.currency, (revenueByCurrency.get(p.currency) ?? 0) + Number(p.amount));
  }

  const enrollmentsByCourse = new Map<string, number>();
  for (const row of enrollmentRows) {
    enrollmentsByCourse.set(row.course_title, (enrollmentsByCourse.get(row.course_title) ?? 0) + 1);
  }
  const courseCounts = [...enrollmentsByCourse.entries()].sort((a, b) => b[1] - a[1]);
  const maxCourseCount = courseCounts.length > 0 ? courseCounts[0][1] : 0;

  return (
    <section className="py-16">
      <div className="container-page">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Painel Admin</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Olá, {admin.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{admin.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminNotificationBell />
            <SignOutButton />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link href="/admin/formacoes" className="text-gold-dark underline">
            Gerir conteúdo das formações (módulos e aulas)
          </Link>
          <Link href="/admin/pagamentos" className="text-gold-dark underline">
            Ver todos os pagamentos
          </Link>
          <Link href="/admin/insights" className="text-gold-dark underline">
            Gerir Wealth Insights (autores e artigos)
          </Link>
          <Link href="/admin/formadores" className="text-gold-dark underline">
            Gerir Formadores
          </Link>
          <Link href="/admin/workshops" className="text-gold-dark underline">
            Gerir Workshops
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded border border-ink/10 bg-white/60 p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
              <UsersIcon className="h-[18px] w-[18px] text-gold-dark" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-ink-soft">Inscrições</p>
            <p className="mt-2 font-display text-3xl text-ink">{enrollmentRows.length}</p>
          </div>
          <div className="rounded border border-ink/10 bg-white/60 p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
              <UserPlusIcon className="h-[18px] w-[18px] text-gold-dark" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-ink-soft">Leads</p>
            <p className="mt-2 font-display text-3xl text-ink">{leadRows.length}</p>
          </div>
          <div className="rounded border border-ink/10 bg-white/60 p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
              <CoinIcon className="h-[18px] w-[18px] text-gold-dark" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-ink-soft">Receita confirmada</p>
            <p className="mt-2 font-display text-3xl text-ink">
              {revenueByCurrency.size === 0
                ? "0 Kz"
                : [...revenueByCurrency.entries()]
                    .map(([currency, total]) => `${total.toLocaleString("pt-PT")} ${currency === "AOA" ? "Kz" : currency}`)
                    .join(" · ")}
            </p>
          </div>
        </div>

        {courseCounts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">
              Inscrições por formação
            </h2>
            <div className="mt-3 space-y-3">
              {courseCounts.map(([title, count]) => (
                <div key={title}>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>{title}</span>
                    <span>{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${maxCourseCount > 0 ? (count / maxCourseCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14">
          <h2 className="text-lg font-medium text-ink">Inscrições ({enrollmentRows.length})</h2>
          {enrollmentRows.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Ainda não há inscrições.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4">Aluno</th>
                    <th className="py-2 pr-4">Formação</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4">Progresso</th>
                    <th className="py-2 pr-4">Acção</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollmentRows.map((row) => {
                    const student = studentOf(row);
                    const progress = row.status === "Concluída" ? 100 : row.progress_percent;
                    return (
                      <tr key={row.id} className="border-b border-ink/5">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-ink">{student?.name ?? "—"}</p>
                          <p className="text-xs text-ink-soft">{student?.email ?? ""}</p>
                        </td>
                        <td className="py-3 pr-4 text-ink">{row.course_title}</td>
                        <td className="py-3 pr-4 text-ink-soft">{row.status}</td>
                        <td className="py-3 pr-4 text-ink-soft">{progress}%</td>
                        <td className="py-3 pr-4">
                          {row.status !== "Concluída" ? (
                            <ConcluirInscricaoButton enrollmentId={row.id} />
                          ) : (
                            (() => {
                              const cert = certificateByEnrollment.get(row.id);
                              return (
                                <div className="flex flex-wrap items-center gap-3">
                                  {cert?.file_path && (
                                    <a
                                      href={`/api/validar/${cert.certificate_number}/ficheiro`}
                                      className="text-xs font-medium text-gold-dark underline"
                                    >
                                      Descarregar certificado
                                    </a>
                                  )}
                                  <CertificateUploadForm
                                    enrollmentId={row.id}
                                    hasCertificate={Boolean(cert?.file_path)}
                                  />
                                </div>
                              );
                            })()
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-ink">Leads ({leadRows.length})</h2>
            {leadRows.length > 0 && (
              <a
                href="/api/admin/leads/export"
                className="rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/40"
              >
                Exportar CSV
              </a>
            )}
          </div>
          {leadRows.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Ainda não há leads.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4">Nome</th>
                    <th className="py-2 pr-4">Contacto</th>
                    <th className="py-2 pr-4">Interesse</th>
                    <th className="py-2 pr-4">Origem</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="w-8 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {leadRows.map((lead) => {
                    // Leads do formulário "Para Empresas" trazem campos extra
                    // (cargo, participantes, modalidade, etc.) que não cabem
                    // na tabela principal — LeadTableRow mostra-os por trás de
                    // uma seta, numa faixa própria a toda a largura, só
                    // quando há de facto algo para mostrar.
                    const extraFields: Array<[string, string]> = (
                      [
                        ["Empresa", lead.company ?? ""],
                        ["Cargo", lead.role ?? ""],
                        ["Participantes", lead.participants ?? ""],
                        ["Modalidade preferencial", lead.preferred_modality ?? ""],
                        ["Necessidade de formação", lead.training_need ?? ""],
                        ["Mensagem", lead.message ?? ""],
                      ] as Array<[string, string]>
                    ).filter(([, value]) => value);

                    return <LeadTableRow key={lead.id} lead={lead} extraFields={extraFields} />;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
