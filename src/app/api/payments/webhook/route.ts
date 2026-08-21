import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Recebe o callback assíncrono da ProxyPay/EMIS GPO quando uma "charge" é
// usada (aceite ou rejeitada). Ver "Callback Notification" em
// https://developer.proxypay.co.ao/opg/v1/
//
// Este endpoint fica fora do gate de staging (ver src/middleware.ts) —
// tem de ser publicamente acessível para a EMIS conseguir chamá-lo.
export async function POST(request: Request) {
  const transaction = await request.json().catch(() => null);

  if (!transaction?.charge_id) {
    // Pode ser um transaction sem charge_id (ex. pagamento directo por
    // mobile) — por agora só tratamos o fluxo de charges (QR/Deeplink).
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createSupabaseAdminClient();

  const status =
    transaction.status === "accepted"
      ? "accepted"
      : transaction.status === "rejected"
        ? "rejected"
        : "pending";

  const { data: payment, error } = await supabase
    .from("payments")
    .update({
      status,
      provider_transaction_id: transaction.id,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_charge_id", transaction.charge_id)
    .select()
    .single();

  if (error) {
    console.error("[payments/webhook] falha ao actualizar pagamento", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (status === "accepted" && payment?.enrollment_id) {
    await supabase
      .from("enrollments")
      .update({ status: "Em curso", updated_at: new Date().toISOString() })
      .eq("id", payment.enrollment_id);
  }

  return NextResponse.json({ ok: true });
}
