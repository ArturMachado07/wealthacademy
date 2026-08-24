import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createCharge } from "@/lib/payments/proxypay";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentStudent } from "@/lib/auth";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";
import { alertServerError } from "@/lib/error-alert";

const PROXYPAY_CONFIGURED = Boolean(
  process.env.PROXYPAY_API_TOKEN && process.env.PROXYPAY_POS_ID
);

// Converte o texto do preço (ex. "75.000 Kz") no valor numérico em Kz —
// mesma lógica usada em PaymentButton.tsx para mostrar o preço ao aluno.
function parseInvestment(investment?: string | null): number | null {
  if (!investment) return null;
  const digits = investment.replace(/[^\d]/g, "");
  const value = Number(digits);
  return value > 0 ? value : null;
}

// Cria um pedido de pagamento (Multicaixa Express via ProxyPay/GPO) para uma
// formação. Espera { courseSlug, courseTitle } no corpo do pedido — o preço
// é sempre calculado no servidor (nunca confiado do browser, ver acima) —
// cria a inscrição com estado "Pendente" (ver supabase/006) e só passa a
// "Em curso" quando o pagamento for confirmado.
//
// MODO DEMO: enquanto PROXYPAY_API_TOKEN/PROXYPAY_POS_ID não estiverem
// configurados (ver .env.example), este endpoint não contacta a ProxyPay —
// cria um pagamento simulado (`provider: "demo"`) que só se confirma
// através de /api/payments/demo-confirm (nunca sozinho). Assim que as
// credenciais reais forem definidas, passa a usar a ProxyPay de verdade,
// sem alterar nenhum componente do site.
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.courseSlug || !body?.courseTitle) {
    return NextResponse.json(
      { ok: false, error: "courseSlug e courseTitle são obrigatórios." },
      { status: 400 }
    );
  }

  // Nunca confiamos no "amount" enviado pelo browser — alguém podia alterá-lo
  // no devtools e pagar o valor que quisesse. O preço oficial vem sempre do
  // servidor: catálogo estático (src/data/courses.ts) com o eventual
  // override de preço definido pelo Admin (tabela course_pricing).
  const course = courses.find((c) => c.slug === body.courseSlug);
  if (!course) {
    return NextResponse.json({ ok: false, error: "Formação não encontrada." }, { status: 404 });
  }

  const overrides = await getCourseOverrides();
  const priced = applyCourseOverride(course, overrides.get(course.slug));
  const amount = parseInvestment(priced.investment);

  if (!amount) {
    return NextResponse.json(
      { ok: false, error: "Esta formação ainda não tem um preço definido." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";
  const idempotencyKey = randomUUID();
  const supabase = createSupabaseAdminClient();

  try {
    // Já inscrito (activo ou concluído) — não cria pagamento duplicado.
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("student_id", student.id)
      .eq("course_slug", body.courseSlug)
      .in("status", ["Em curso", "Concluída"])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, alreadyEnrolled: true });
    }

    // Reaproveita uma inscrição "Pendente" já criada numa tentativa anterior,
    // em vez de duplicar.
    const { data: pending } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_slug", body.courseSlug)
      .eq("status", "Pendente")
      .maybeSingle();

    const enrollmentId =
      pending?.id ??
      (
        await supabase
          .from("enrollments")
          .insert({
            student_id: student.id,
            course_slug: body.courseSlug,
            course_title: course.title,
            status: "Pendente",
            progress_percent: 0,
          })
          .select("id")
          .single()
      ).data?.id;

    if (!enrollmentId) throw new Error("Não foi possível criar a inscrição.");

    if (!PROXYPAY_CONFIGURED) {
      const { data: payment, error } = await supabase
        .from("payments")
        .insert({
          student_id: student.id,
          enrollment_id: enrollmentId,
          amount,
          provider: "demo",
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ ok: true, demo: true, paymentId: payment.id });
    }

    const charge = await createCharge({
      amount: amount.toFixed(2),
      callbackUrl: `${siteUrl}/api/payments/webhook`,
      idempotencyKey,
    });

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        student_id: student.id,
        enrollment_id: enrollmentId,
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
    await alertServerError("payments/charge", err);
    return NextResponse.json(
      { ok: false, error: "Não foi possível iniciar o pagamento." },
      { status: 502 }
    );
  }
}
