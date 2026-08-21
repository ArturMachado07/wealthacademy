import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Permite ao browser consultar o estado de um pagamento (polling simples
// enquanto o aluno completa o pagamento no telemóvel), sem depender só do
// webhook.
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, status, amount, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (error || !payment) {
    return NextResponse.json({ ok: false, error: "Pagamento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, payment });
}
