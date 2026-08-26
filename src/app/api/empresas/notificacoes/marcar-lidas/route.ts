import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Marca todas as notificações não lidas da empresa autenticada como lidas —
// RLS ("Empresa marca as próprias notificações como lidas") garante que só
// consegue actualizar as suas próprias.
export async function POST() {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("company_notifications").update({ read: true }).eq("read", false);

  if (error) {
    console.error("[empresas/notificacoes/marcar-lidas] falha:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
