import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Exporta todos os leads para CSV. Só acessível a administradores (via
// sessão de cookies — chamado directamente pelo browser, não por fetch).
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/leads/export] falha ao ler leads:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível exportar." }, { status: 500 });
  }

  const columns = [
    "name",
    "email",
    "phone",
    "interest",
    "origin",
    "course_slug",
    "company",
    "role",
    "participants",
    "training_need",
    "preferred_modality",
    "message",
    "status",
    "created_at",
  ];

  const header = columns.join(",");
  const rows = (leads ?? []).map((lead) => columns.map((col) => csvEscape(lead[col])).join(","));
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-wealth-academy-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
