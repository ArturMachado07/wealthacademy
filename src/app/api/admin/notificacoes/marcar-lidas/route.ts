import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Marca todas as notificações do Admin como lidas — não há RLS a filtrar
// por utilizador (só existe um painel Admin), por isso basta a autenticação.
export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_notifications").update({ read: true }).eq("read", false);

  if (error) {
    console.error("[admin/notificacoes/marcar-lidas] falha:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
