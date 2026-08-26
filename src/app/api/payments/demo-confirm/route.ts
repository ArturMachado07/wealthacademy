import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendEnrollmentConfirmationEmail } from "@/lib/email";
import { createNotification, createAdminNotification } from "@/lib/notifications";
import { activateTurma } from "@/lib/turma-activation";
import { alertServerError } from "@/lib/error-alert";

// Confirma um pagamento em MODO DEMO (nunca chama a ProxyPay — só existe
// enquanto PROXYPAY_API_TOKEN/PROXYPAY_POS_ID não estiverem configurados).
// Simula o que o webhook real faz quando a EMIS confirma um pagamento
// aceite. Serve tanto o pagamento individual do aluno (enrollment_id) como
// o pagamento de uma turma pela empresa (turma_id) — ver
// /api/empresas/turmas/[id]/pagar.
export async function POST(request: Request) {
  if (process.env.PROXYPAY_API_TOKEN && process.env.PROXYPAY_POS_ID) {
    return NextResponse.json(
      { ok: false, error: "Pagamentos reais já estão activos — este endpoint é só para o modo demo." },
      { status: 400 }
    );
  }

  const student = await getCurrentStudent();
  const company = student ? null : await getCurrentCompany();
  if (!student && !company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.paymentId) {
    return NextResponse.json({ ok: false, error: "paymentId em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, student_id, enrollment_id, company_id, turma_id, provider, status")
    .eq("id", body.paymentId)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ ok: false, error: "Pagamento não encontrado." }, { status: 404 });
  }

  // Só o dono do pagamento (aluno ou empresa) o pode confirmar.
  const isOwner = student ? payment.student_id === student.id : payment.company_id === company?.id;
  if (!isOwner) {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  if (payment.provider !== "demo") {
    return NextResponse.json({ ok: false, error: "Este pagamento não está em modo demo." }, { status: 400 });
  }

  if (payment.status === "accepted") {
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", payment.id);

  if (updateError) {
    await alertServerError("payments/demo-confirm: actualizar pagamento", updateError);
    return NextResponse.json({ ok: false, error: "Não foi possível confirmar." }, { status: 500 });
  }

  if (payment.turma_id) {
    await activateTurma(supabase, payment.turma_id);
  } else if (payment.enrollment_id && student) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .update({ status: "Em curso", updated_at: new Date().toISOString() })
      .eq("id", payment.enrollment_id)
      .select("course_title")
      .single();

    if (enrollment) {
      await sendEnrollmentConfirmationEmail({
        to: student.email,
        name: student.name,
        courseTitle: enrollment.course_title,
      });
      await createNotification(supabase, {
        studentId: student.id,
        title: "Inscrição confirmada",
        message: `A sua inscrição em "${enrollment.course_title}" foi confirmada.`,
        link: "/aluno",
      });
      await createAdminNotification(supabase, {
        title: "Pagamento confirmado",
        message: `${student.name} confirmou o pagamento da inscrição em "${enrollment.course_title}".`,
        link: "/admin",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
