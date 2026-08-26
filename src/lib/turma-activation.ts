import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEnrollmentConfirmationEmail } from "@/lib/email";
import { createNotification, createCompanyNotification } from "@/lib/notifications";

// Activa uma turma depois do pagamento ser aceite (demo ou ProxyPay real) —
// chamado a partir de /api/payments/demo-confirm e /api/payments/webhook,
// nunca directamente pelo Admin. Idempotente: se a turma já estiver "paga"
// (ex.: webhook duplicado), não faz nada.
export async function activateTurma(supabase: SupabaseClient, turmaId: string) {
  const { data: turma } = await supabase
    .from("turmas")
    .select("id, company_id, course_title, status")
    .eq("id", turmaId)
    .maybeSingle();

  if (!turma || turma.status === "paga") return;

  await supabase.from("turmas").update({ status: "paga", paid_at: new Date().toISOString() }).eq("id", turmaId);

  const { data: members } = await supabase
    .from("enrollments")
    .update({ status: "Em curso", updated_at: new Date().toISOString() })
    .eq("turma_id", turmaId)
    .eq("status", "Pendente")
    .select("student_id, students(name, email)");

  for (const member of members ?? []) {
    const s = Array.isArray(member.students) ? member.students[0] : member.students;
    if (!s) continue;
    await sendEnrollmentConfirmationEmail({ to: s.email, name: s.name, courseTitle: turma.course_title });
    await createNotification(supabase, {
      studentId: member.student_id,
      title: "Inscrição confirmada",
      message: `A sua inscrição em "${turma.course_title}" foi confirmada — a sua empresa concluiu o pagamento da turma.`,
      link: "/aluno",
    });
  }

  await createCompanyNotification(supabase, {
    companyId: turma.company_id,
    title: "Turma paga e activada",
    message: `O pagamento da turma de "${turma.course_title}" foi confirmado — os colaboradores já têm acesso ao conteúdo. A factura fica disponível assim que o Admin a anexar.`,
    link: "/empresa",
  });
}
