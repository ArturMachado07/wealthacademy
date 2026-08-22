import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pagamentos — Admin" };
export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
  students: { name: string; email: string } | { name: string; email: string }[] | null;
  enrollments: { course_title: string } | { course_title: string }[] | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceite",
  rejected: "Recusado",
  expired: "Expirado",
};

function studentOf(row: PaymentRow) {
  return Array.isArray(row.students) ? row.students[0] : row.students;
}

function courseOf(row: PaymentRow) {
  return Array.isArray(row.enrollments) ? row.enrollments[0] : row.enrollments;
}

export default async function AdminPagamentosPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, provider, status, created_at, students(name, email), enrollments(course_title)")
    .order("created_at", { ascending: false });

  const paymentRows = (payments ?? []) as PaymentRow[];

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin" className="text-sm text-ink-soft underline">
          ← Painel Admin
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Painel Admin</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Pagamentos ({paymentRows.length})</h1>
        </div>

        <div className="mt-10">
          {paymentRows.length === 0 ? (
            <p className="text-sm text-ink-soft">Ainda não há pagamentos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4">Aluno</th>
                    <th className="py-2 pr-4">Formação</th>
                    <th className="py-2 pr-4">Valor</th>
                    <th className="py-2 pr-4">Fornecedor</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((row) => {
                    const student = studentOf(row);
                    const course = courseOf(row);
                    return (
                      <tr key={row.id} className="border-b border-ink/5">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-ink">{student?.name ?? "—"}</p>
                          <p className="text-xs text-ink-soft">{student?.email ?? ""}</p>
                        </td>
                        <td className="py-3 pr-4 text-ink">{course?.course_title ?? "—"}</td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {Number(row.amount).toLocaleString("pt-PT")}{" "}
                          {row.currency === "AOA" ? "Kz" : row.currency}
                        </td>
                        <td className="py-3 pr-4 text-ink-soft">{row.provider}</td>
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
