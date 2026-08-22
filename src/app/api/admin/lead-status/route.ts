import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["Novo", "Contactado", "Interessado", "Inscrito", "Convertido"];

// Actualiza o estado de um lead. Só acessível a administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const leadId = body?.leadId;
  const status = body?.status;

  if (!leadId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("[wealth-academy] falha ao actualizar lead:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível actualizar o lead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
