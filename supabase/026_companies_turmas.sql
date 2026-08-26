-- B2B: empresa com conta própria (Supabase Auth, tal como o aluno) que gere
-- turmas de colaboradores. Substitui o antigo formulário de lead "Para
-- Empresas" — a empresa passa a ter self-service, em vez de mandar um
-- pedido manual por email/WhatsApp.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  nif text,
  contact_email text not null unique,
  contact_phone text,
  created_at timestamptz not null default now()
);

-- Turma: até 6 colaboradores de uma empresa, inscritos juntos numa
-- formação. A empresa paga pela turma toda (não cada colaborador) — ver
-- enrollments.turma_id abaixo. Só tem desconto de 5% se fechar com 6/6
-- (discount_applied); se a empresa decidir fechar incompleta antes disso,
-- fica sem desconto.
create table if not exists turmas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  course_slug text not null,
  course_title text not null,
  invite_code text not null unique,
  capacity int not null default 6,
  status text not null default 'a_preencher' check (status in ('a_preencher', 'fechada', 'paga')),
  discount_applied boolean not null default false,
  invoice_path text,
  closed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists turmas_company_id_idx on turmas(company_id, created_at desc);
create index if not exists turmas_invite_code_idx on turmas(invite_code);

-- Liga a inscrição de um colaborador à turma de que faz parte. A inscrição
-- em si continua a ser uma linha normal de `enrollments` (o colaborador é
-- sempre também um `student` com a sua própria conta) — só que activa em
-- bloco quando a turma é paga, em vez de pagamento individual.
alter table enrollments add column if not exists turma_id uuid references turmas(id) on delete set null;
create index if not exists enrollments_turma_id_idx on enrollments(turma_id);

-- Centro de notificações da empresa — mesmo padrão de notifications (aluno)
-- e admin_notifications (admin).
create table if not exists company_notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists company_notifications_company_id_idx on company_notifications(company_id, created_at desc);

-- Bucket para os comprovativos de pagamento das turmas (mesmo padrão dos
-- buckets "facturas" e "certificados").
insert into storage.buckets (id, name, public)
values ('facturas-turmas', 'facturas-turmas', false)
on conflict (id) do nothing;

alter table companies enable row level security;
alter table turmas enable row level security;
alter table company_notifications enable row level security;

drop policy if exists "Empresa vê o próprio registo" on companies;
create policy "Empresa vê o próprio registo" on companies
  for select using (auth.uid() = auth_user_id);

drop policy if exists "Empresa vê as próprias turmas" on turmas;
create policy "Empresa vê as próprias turmas" on turmas
  for select using (
    company_id in (select id from companies where auth_user_id = auth.uid())
  );

drop policy if exists "Empresa vê as próprias notificações" on company_notifications;
create policy "Empresa vê as próprias notificações" on company_notifications
  for select using (
    company_id in (select id from companies where auth_user_id = auth.uid())
  );

drop policy if exists "Empresa marca as próprias notificações como lidas" on company_notifications;
create policy "Empresa marca as próprias notificações como lidas" on company_notifications
  for update using (
    company_id in (select id from companies where auth_user_id = auth.uid())
  )
  with check (
    company_id in (select id from companies where auth_user_id = auth.uid())
  );

-- O trigger que cria automaticamente um `student` em cada signup (ver
-- 002_auto_create_student.sql) passa agora a olhar para o metadata
-- "account_type" enviado pelo formulário de registo — "company" cria uma
-- empresa em vez de um aluno. Sem esta alteração, toda a gente que se
-- registasse como empresa ganhava também, por engano, uma conta de aluno.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data->>'account_type', 'student') = 'company' then
    insert into public.companies (auth_user_id, name, contact_email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email
    )
    on conflict (auth_user_id) do nothing;
  else
    insert into public.students (auth_user_id, name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email
    )
    on conflict (auth_user_id) do nothing;
  end if;
  return new;
end;
$$;

-- O formulário de lead "Para Empresas" deixa de existir (substituído por
-- conta self-service da empresa) — remove os leads antigos dessa origem.
delete from leads where origin = 'Para Empresas';
