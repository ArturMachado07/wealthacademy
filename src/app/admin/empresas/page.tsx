import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import TurmaInvoiceUploadForm from "@/components/admin/TurmaInvoiceUploadForm";

export const metadata: Metadata = { title: "Empresas — Admin" };
export const dynamic = "force-dynamic";

type Company = { id: string; name: string; nif: string | null; contact_email: string; contact_phone: string | null };
type Turma = {
  id: string;
  company_id: string;
  course_title: string;
  capacity: number;
  status: "a_preencher" | "fechada" | "paga";
  discount_applied: boolean;
  invoice_path: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<Turma["status"], string> = {
  a_preencher: "A preencher",
  fechada: "Fechada · a aguardar pagamento",
  paga: "Paga · activa",
};

const STATUS_CLASS: Record<Turma["status"], string> = {
  a_preencher: "bg-gold/10 text-gold-dark",
  fechada: "bg-red-100 text-red-700",
  paga: "bg-green-100 text-green-800",
};

export default async function AdminEmpresasPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();

  const [{ data: companiesData }, { data: turmasData }] = await Promise.all([
    supabase.from("companies").select("id, name, nif, contact_email, contact_phone").order("name"),
    supabase
      .from("turmas")
      .select("id, company_id, course_title, capacity, status, discount_applied, invoice_path, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const companies = (companiesData ?? []) as Company[];
  const turmas = (turmasData ?? []) as Turma[];

  const memberCounts = new Map<string, number>();
  if (turmas.length > 0) {
    const { data: enrollmentRows } = await supabase
      .from("enrollments")
      .select("turma_id")
      .not("turma_id", "is", null);
    for (const row of enrollmentRows ?? []) {
      const key = row.turma_id as string;
      memberCounts.set(key, (memberCounts.get(key) ?? 0) + 1);
    }
  }

  const turmasByCompany = new Map<string, Turma[]>();
  for (const turma of turmas) {
    const list = turmasByCompany.get(turma.company_id) ?? [];
    list.push(turma);
    turmasByCompany.set(turma.company_id, list);
  }

  return (
    <section className="py-16">
      <div className="container-page">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Painel Admin</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Empresas e turmas</h1>
          </div>
          <Link href="/admin" className="text-sm text-gold-dark underline">
            Voltar ao painel
          </Link>
        </div>

        {companies.length === 0 ? (
          <p className="mt-8 text-sm text-ink-soft">Ainda não há empresas registadas.</p>
        ) : (
          <div className="mt-8 space-y-6">
            {companies.map((company) => {
              const companyTurmas = turmasByCompany.get(company.id) ?? [];
              return (
                <div key={company.id} className="rounded border border-ink/10 bg-white/60 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base font-medium text-ink">{company.name}</p>
                    <p className="text-xs text-ink-soft">
                      {company.contact_email}
                      {company.contact_phone ? ` · ${company.contact_phone}` : ""}
                      {company.nif ? ` · NIF ${company.nif}` : ""}
                    </p>
                  </div>

                  {companyTurmas.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">Ainda sem turmas.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[560px] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                            <th className="py-2 pr-4">Turma</th>
                            <th className="py-2 pr-4">Colaboradores</th>
                            <th className="py-2 pr-4">Estado</th>
                            <th className="py-2 pr-4">Acção</th>
                          </tr>
                        </thead>
                        <tbody>
                          {companyTurmas.map((turma) => (
                            <tr key={turma.id} className="border-b border-ink/5 last:border-b-0">
                              <td className="py-3 pr-4 font-medium text-ink">{turma.course_title}</td>
                              <td className="py-3 pr-4 text-ink-soft">
                                {memberCounts.get(turma.id) ?? 0}/{turma.capacity}
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[turma.status]}`}
                                >
                                  {STATUS_LABEL[turma.status]}
                                  {turma.status !== "a_preencher" && !turma.discount_applied ? " · sem desconto" : ""}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                {turma.status === "fechada" && (
                                  <span className="text-xs text-ink-soft">A aguardar pagamento da empresa</span>
                                )}
                                {turma.status === "paga" && (
                                  <TurmaInvoiceUploadForm turmaId={turma.id} hasInvoice={Boolean(turma.invoice_path)} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
