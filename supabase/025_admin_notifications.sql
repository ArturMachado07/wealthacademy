-- Centro de notificações do Admin — espelha o dos alunos (020_notifications.sql)
-- mas para o painel administrativo: alerta o Admin quando um aluno confirma
-- um pagamento/inscrição ou termina todas as aulas de um curso.
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_at_idx on admin_notifications(created_at desc);

alter table admin_notifications enable row level security;

-- Sem policies de select/insert/update: tal como a tabela `leads`, só é
-- acedida pelo painel Admin através da service role key (bypassa RLS) — não
-- há sessão Supabase Auth do lado do Admin para uma policy se agarrar.
