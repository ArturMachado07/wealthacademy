import type { SupabaseClient } from "@supabase/supabase-js";

// Cria uma notificação no centro de notificações do aluno (ver
// supabase/020_notifications.sql). Chamado a partir de rotas de servidor
// que já usam a service role — nunca falha de forma bloqueante: se der
// erro, só regista no log (a notificação é um extra, não deve impedir o
// resto do fluxo, tal como o próprio envio de email).
export async function createNotification(
  supabase: SupabaseClient,
  params: { studentId: string; title: string; message: string; link?: string }
) {
  const { error } = await supabase.from("notifications").insert({
    student_id: params.studentId,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
  });

  if (error) {
    console.error("[notifications] falha ao criar notificação:", error);
  }
}

// Cria uma notificação no centro de notificações do Admin (ver
// supabase/025_admin_notifications.sql) — o mesmo espírito da de cima, mas
// para alertar a equipa sobre o que os alunos vão fazendo (pagamentos
// confirmados, cursos terminados), sem terem de ir conferir o dashboard.
export async function createAdminNotification(
  supabase: SupabaseClient,
  params: { title: string; message: string; link?: string }
) {
  const { error } = await supabase.from("admin_notifications").insert({
    title: params.title,
    message: params.message,
    link: params.link ?? null,
  });

  if (error) {
    console.error("[notifications] falha ao criar notificação de admin:", error);
  }
}
