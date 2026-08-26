import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";
import { parseInvestment, turmaTotal } from "@/lib/pricing";
import { createCharge } from "@/lib/payments/proxypay";
import { alertServerError } from "@/lib/error-alert";

const PROXYPAY_CONFIGURED = Boolean(process.env.PROXYPAY_API_TOKEN && process.env.PROXYPAY_POS_ID);

// Cria o pagamento da turma toda, pela empresa — mesmo mecanismo do
// /api/payments/charge (Multicaixa Express via ProxyPay, ou modo demo
// enquanto não há credenciais). O valor nunca vem do browser: é sempre
// recalculado aqui a partir do preço do curso × nº de colaboradores já
// inscritos, com o desconto de 5% só se a turma tiver fechado completa.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { id: turmaId } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: turma, error: fetchError } = await supabase
    .from("turmas")
    .select("id, company_id, course_slug, course_title, status, discount_applied")
    .eq("id", turmaId)
    .single();

  if (fetchError || !turma) {
    return NextResponse.json({ ok: false, error: "Turma não encontrada." }, { status: 404 });
  }

  if (turma.company_id !== company.id) {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  if (turma.status !== "fechada") {
    return NextResponse.json(
      { ok: false, error: "Esta turma ainda não está fechada, ou já foi paga." },
      { status: 400 }
    );
  }

  // Já existe um pagamento pendente para esta turma? Reaproveita em vez de
  // duplicar (mesmo padrão de /api/payments/charge).
  const { data: pending } = await supabase
    .from("payments")
    .select("id, provider, status")
    .eq("turma_id", turmaId)
    .eq("status", "pending")
    .maybeSingle();

  const course = courses.find((c) => c.slug === turma.course_slug);
  if (!course) {
    return NextResponse.json({ ok: false, error: "Formação não encontrada." }, { status: 404 });
  }

  const overrides = await getCourseOverrides();
  const priced = applyCourseOverride(course, overrides.get(course.slug));
  const unitPrice = parseInvestment(priced.investment);
  if (!unitPrice) {
    return NextResponse.json({ ok: false, error: "Esta formação ainda não tem um preço definido." }, { status: 400 });
  }

  const { count: memberCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("turma_id", turmaId);

  if (!memberCount || memberCount === 0) {
    return NextResponse.json({ ok: false, error: "A turma não tem colaboradores." }, { status: 400 });
  }

  const amount = turmaTotal(unitPrice, memberCount, turma.discount_applied);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";

  try {
    if (!PROXYPAY_CONFIGURED) {
      if (pending && pending.provider === "demo") {
        return NextResponse.json({ ok: true, demo: true, paymentId: pending.id });
      }
      const { data: payment, error } = await supabase
        .from("payments")
        .insert({ company_id: company.id, turma_id: turmaId, amount, provider: "demo", status: "pending" })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, demo: true, paymentId: payment.id });
    }

    const charge = await createCharge({
      amount: amount.toFixed(2),
      callbackUrl: `${siteUrl}/api/payments/webhook`,
      idempotencyKey: randomUUID(),
    });

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        company_id: company.id,
        turma_id: turmaId,
        amount,
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
    await alertServerError("empresas/turmas/pagar", err);
    return NextResponse.json({ ok: false, error: "Não foi possível iniciar o pagamento." }, { status: 502 });
  }
}
