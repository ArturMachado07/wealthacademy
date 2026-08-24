import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendEnrollmentConfirmationEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { getTransaction } from "@/lib/payments/proxypay";

// Recebe o callback assíncrono da ProxyPay/EMIS GPO quando uma "charge" é
// usada (aceite ou rejeitada). Ver "Callback Notification" em
// https://developer.proxypay.co.ao/opg/v1/
//
// Este endpoint fica fora do gate de staging (ver src/middleware.ts) —
// tem de ser publicamente acessível para a EMIS conseguir chamá-lo.
//
// IMPORTANTE: a documentação oficial da ProxyPay OPG v1 não define nenhum
// cabeçalho de assinatura para este callback — ou seja, não há forma de
// confirmar, só a partir do corpo do POST, que o pedido veio mesmo da
// ProxyPay e não de alguém a forjar um pedido a apontar para este URL
// público. Por isso nunca confiamos no "status" enviado no corpo: usamos
// só o "id" da transacção para voltar a perguntar à API da ProxyPay (com o
// nosso Bearer token, que um atacante não tem) qual é o estado real — e
// actualizamos a base de dados com base nessa resposta autoritativa.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let transaction;
  try {
    transaction = await getTransaction(body.id);
  } catch (err) {
    console.error("[payments/webhook] falha ao confirmar transacção junto da ProxyPay", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  if (!transaction.charge_id) {
    // Pode ser uma transacção sem charge_id (ex. pagamento directo por
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
    const { data: enrollment } = await supabase
      .from("enrollments")
      .update({ status: "Em curso", updated_at: new Date().toISOString() })
      .eq("id", payment.enrollment_id)
      .select("course_title, student_id")
      .single();

    if (enrollment?.student_id) {
      const { data: student } = await supabase
        .from("students")
        .select("name, email")
        .eq("id", enrollment.student_id)
        .single();

      if (student) {
        await sendEnrollmentConfirmationEmail({
          to: student.email,
          name: student.name,
          courseTitle: enrollment.course_title,
        });
        await createNotification(supabase, {
          studentId: payment.student_id,
          title: "Inscrição confirmada",
          message: `A sua inscrição em "${enrollment.course_title}" foi confirmada.`,
          link: "/aluno",
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
