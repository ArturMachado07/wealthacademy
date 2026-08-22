import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  enrollments: { course_title: string } | { course_title: string }[] | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceite",
  rejected: "Recusado",
  expired: "Expirado",
};

function courseOf(row: PaymentRow) {
  return Array.isArray(row.enrollments) ? row.enrollments[0] : row.enrollments;
}

export default async function AlunoPagamentosPage() {
  const student = await getCurrentStudent();
  if (!student) {
    redirect("/aluno/login?from=/aluno/pagamentos");
  }

  const supabase = await createSupabaseServerClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, provider, status, created_at, enrollments(course_title)")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  const paymentRows = (payments ?? []) as PaymentRow[];

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/aluno" className="text-sm text-ink-soft underline">
          ← Voltar ao dashboard
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Área do Aluno</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Os meus pagamentos</h1>
        </div>

        <div className="mt-10">
          {paymentRows.length === 0 ? (
            <EmptyState
              eyebrow="Ainda sem pagamentos"
              title="Ainda não há pagamentos registados"
              description="Assim que se inscrever numa formação com investimento associado, o pagamento aparece aqui."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4">Formação</th>
                    <th className="py-2 pr-4">Valor</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((row) => {
                    const course = courseOf(row);
                    return (
                      <tr key={row.id} className="border-b border-ink/5">
                        <td className="py-3 pr-4 text-ink">{course?.course_title ?? "—"}</td>
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
