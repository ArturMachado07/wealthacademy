import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createCharge } from "@/lib/payments/proxypay";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentStudent } from "@/lib/auth";

// Cria um pedido de pagamento (Multicaixa Express via ProxyPay/GPO) para uma
// formação. Espera { courseSlug, courseTitle, amount } no corpo do pedido —
// cria a inscrição com estado "Pendente" (ver supabase/006) e só passa a
// "Em curso" quando o webhook confirmar o pagamento.
// Requer PROXYPAY_API_TOKEN, PROXYPAY_POS_ID e a base de dados Supabase
// configurados — ver .env.example e supabase/schema.sql.
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.courseSlug || !body?.courseTitle || !body?.amount) {
    return NextResponse.json(
      { ok: false, error: "courseSlug, courseTitle e amount são obrigatórios." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";
  const idempotencyKey = randomUUID();
  const supabase = createSupabaseAdminClient();

  try {
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        student_id: student.id,
        course_slug: body.courseSlug,
        course_title: body.courseTitle,
        status: "Pendente",
        progress_percent: 0,
      })
      .select()
      .single();

    if (enrollmentError) throw enrollmentError;

    const charge = await createCharge({
      amount: Number(body.amount).toFixed(2),
      callbackUrl: `${siteUrl}/api/payments/webhook`,
      idempotencyKey,
    });

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        student_id: student.id,
        enrollment_id: enrollment.id,
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
