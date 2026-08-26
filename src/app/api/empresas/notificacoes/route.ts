import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Lista as últimas notificações da empresa autenticada — usa o cliente com
// RLS (a policy "Empresa vê as próprias notificações" já restringe à
// sessão actual), tal como /api/aluno/notificacoes.
export async function GET() {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("company_notifications")
    .select("id, title, message, link, read, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[empresas/notificacoes] falha ao ler notificações:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível carregar as notificações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notifications: data ?? [] });
}
