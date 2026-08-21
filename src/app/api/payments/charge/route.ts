import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createCharge } from "@/lib/payments/proxypay";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Cria um pedido de pagamento (Multicaixa Express via ProxyPay/GPO) para uma
// inscrição. Espera { enrollmentId, amount } no corpo do pedido.
// Requer PROXYPAY_API_TOKEN, PROXYPAY_POS_ID e a base de dados Supabase
// configurados — ver .env.example e supabase/schema.sql.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.enrollmentId || !body?.amount) {
    return NextResponse.json(
      { ok: false, error: "enrollmentId e amount são obrigatórios." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";
  const idempotencyKey = randomUUID();

  try {
    const charge = await createCharge({
      amount: Number(body.amount).toFixed(2),
      callbackUrl: `${siteUrl}/api/payments/webhook`,
      idempotencyKey,
    });

    const supabase = createSupabaseAdminClient();
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        enrollment_id: body.enrollmentId,
        amount: body.amount,
        provider: "proxypay",
        provider_charge_id: charge.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      qrcodeUrl: charge.qrcode_url,
      deeplink: charge.deeplink,
      deeplinkRedirect: charge.deeplink_redirect,
      expiresAt: charge.expires_at,
    });
  } catch (err) {
    console.error("[payments/charge]", err);
    return NextResponse.json(
      { ok: false, error: "Não foi possível iniciar o pagamento." },
      { status: 502 }
    );
  }
}
