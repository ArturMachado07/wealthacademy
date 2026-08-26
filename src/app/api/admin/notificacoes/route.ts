import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Lista as últimas notificações do Admin (pagamentos confirmados, cursos
// terminados por alunos). Usa a service role — tal como os leads, esta
// tabela não tem policy de RLS que a sessão de Admin (cookie próprio, não
// Supabase Auth) consiga satisfazer.
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("id, title, message, link, read, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[admin/notificacoes] falha ao ler notificações:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível carregar as notificações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notifications: data ?? [] });
}
