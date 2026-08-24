-- Corre este ficheiro no SQL Editor do Supabase.
-- Centro de notificações do aluno (auditoria de pré-lançamento — item de
-- baixa prioridade, mas pedido agora). Complementa o email, não o
-- substitui: os mesmos momentos que já enviam email (inscrição confirmada,
-- certificado emitido) passam também a criar uma notificação aqui.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_student_id_idx on notifications(student_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "Aluno vê as próprias notificações" on notifications;
create policy "Aluno vê as próprias notificações" on notifications
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

-- Só permite marcar como lida (o aluno não deve poder alterar título/
-- mensagem/link) — a policy não restringe colunas, mas o endpoint da API
-- só envia { read: true }, nunca mais nenhum campo.
drop policy if exists "Aluno marca as próprias notificações como lidas" on notifications;
create policy "Aluno marca as próprias notificações como lidas" on notifications
  for update using (
    student_id in (select id from students where auth_user_id = auth.uid())
  )
  with check (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

-- Sem policy de insert — só o servidor cria notificações, via service role
-- (bypassa RLS), nos mesmos pontos que já enviam email.
