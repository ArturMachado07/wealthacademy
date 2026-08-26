import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = { title: "Os meus pagamentos" };
export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
  turma_id: string | null;
  turmas: { course_title: string; invoice_path: string | null } | { course_title: string; invoice_path: string | null }[] | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceite",
  rejected: "Recusado",
  expired: "Expirado",
};

function turmaOf(row: PaymentRow) {
  return Array.isArray(row.turmas) ? row.turmas[0] : row.turmas;
}

export default async function EmpresaPagamentosPage() {
  const company = await getCurrentCompany();
  if (!company) {
    redirect("/empresas/login?from=/empresa/pagamentos");
  }

  // Usa a service role e filtra explicitamente por company_id — não há
  // policy de RLS dedicada em `payments` para empresas (mesma abordagem já
  // usada em /empresa para ler turmas/inscrições).
  const supabase = createSupabaseAdminClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, provider, status, created_at, turma_id, turmas(course_title, invoice_path)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const paymentRows = (payments ?? []) as PaymentRow[];

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/empresa" className="text-sm text-ink-soft underline">
          ← Voltar ao Portal da Empresa
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Portal da Empresa</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Os meus pagamentos</h1>
        </div>

        <div className="mt-10">
          {paymentRows.length === 0 ? (
            <EmptyState
              eyebrow="Ainda sem pagamentos"
              title="Ainda não há pagamentos registados"
              description="Assim que pagar uma turma, o pagamento aparece aqui."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4">Turma</th>
                    <th className="py-2 pr-4">Valor</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((row) => {
                    const turma = turmaOf(row);
                    return (
                      <tr key={row.id} className="border-b border-ink/5">
                        <td className="py-3 pr-4 text-ink">{turma?.course_title ?? "—"}</td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {Number(row.amount).toLocaleString("pt-PT")} {row.currency}
                          {row.provider === "demo" && (
                            <span className="ml-2 text-xs text-gold-dark">(demo)</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {STATUS_LABEL[row.status] ?? row.status}
                        </td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {new Date(row.created_at).toLocaleDateString("pt-PT")}
                        </td>
                        <td className="py-3 pr-4">
                          {row.status !== "accepted" || !row.turma_id ? (
                            <span className="text-ink-soft">—</span>
                          ) : turma?.invoice_path ? (
                            <a
                              href={`/api/empresas/turmas/${row.turma_id}/factura`}
                              className="font-medium text-gold-dark underline"
                            >
                              Descarregar factura
                            </a>
                          ) : (
                            <span className="text-xs text-ink-soft">A aguardar factura</span>
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
      </div>
    </section>
  );
}
