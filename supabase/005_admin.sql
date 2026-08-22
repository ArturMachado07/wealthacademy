-- Corre este ficheiro no SQL Editor do Supabase.
-- Tabela de administradores (equipa Wealth Academy). Ao contrário dos
-- alunos, não há registo público — contas de admin são criadas manualmente
-- (ver instruções no fim deste ficheiro).

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'Gestor de Formações'
    check (role in ('Director', 'Gestor de Formações', 'Gestor de Leads')),
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

create policy "Admin vê o próprio registo" on admins
  for select using (auth.uid() = auth_user_id);

-- Como criar uma conta de admin (não há registo público, por segurança):
-- 1. Supabase → Authentication → Users → "Add user" → cria o email/password
--    da pessoa (marca "Auto Confirm User" para não precisar de confirmar
--    por email).
-- 2. Copia o "User UID" gerado.
-- 3. Corre (substituindo os valores):
--
-- insert into admins (auth_user_id, name, email, role)
-- values ('<uid-copiado>', 'Nome da Pessoa', 'email@wealthacademy.ao', 'Director');
