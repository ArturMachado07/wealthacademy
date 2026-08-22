import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import ConcluirInscricaoButton from "@/components/admin/ConcluirInscricaoButton";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";

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

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  origin: string;
  status: string;
  created_at: string;
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

  const [{ data: enrollments }, { data: leads }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, course_title, status, progress_percent, enrolled_at, students(name, email)")
      .order("enrolled_at", { ascending: false }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
  ]);

  const enrollmentRows = (enrollments ?? []) as EnrollmentRow[];
  const leadRows = (leads ?? []) as LeadRow[];

  return (
    <section className="py-16">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Painel Admin</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Olá, {admin.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{admin.role}</p>
            <Link href="/admin/formacoes" className="mt-3 inline-block text-sm text-gold-dark underline">
              Gerir conteúdo das formações (módulos e aulas)
            </Link>
          </div>
          <SignOutButton />
        </div>

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
                          {row.status !== "Concluída" && (
                            <ConcluirInscricaoButton enrollmentId={row.id} />
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
          <h2 className="text-lg font-medium text-ink">Leads ({leadRows.length})</h2>
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
                  </tr>
                </thead>
                <tbody>
                  {leadRows.map((lead) => (
                    <tr key={lead.id} className="border-b border-ink/5">
                      <td className="py-3 pr-4 font-medium text-ink">{lead.name}</td>
                      <td className="py-3 pr-4 text-ink-soft">
                        {lead.email}
                        {lead.phone ? ` · ${lead.phone}` : ""}
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">{lead.interest ?? "—"}</td>
                      <td className="py-3 pr-4 text-ink-soft">{lead.origin}</td>
                      <td className="py-3 pr-4">
                        <LeadStatusSelect leadId={lead.id} status={lead.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
