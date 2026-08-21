-- Wealth Academy — Área do Aluno / Admin / Pagamentos
-- Corre este ficheiro no SQL Editor do teu projecto Supabase (supabase.com).
-- Pré-requisito: um projecto Supabase criado (Auth já vem incluído).

create extension if not exists "pgcrypto";

-- Alunos: ligados 1-para-1 a um utilizador de auth.users (Supabase Auth).
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

-- Inscrições: liga um aluno a uma formação (course_slug vem de src/data/courses.ts).
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_slug text not null,
  course_title text not null,
  status text not null default 'Em curso' check (status in ('Em curso', 'Concluída', 'Suspensa')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  next_lesson text,
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Certificados emitidos.
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  enrollment_id uuid references enrollments(id) on delete set null,
  course_title text not null,
  hours text,
  issue_date date not null default current_date,
  certificate_number text not null unique
);

-- Pagamentos — preparado para o Gateway de Pagamentos Online EMIS (via ProxyPay).
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete set null,
  enrollment_id uuid references enrollments(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'AOA',
  provider text not null default 'proxypay',
  provider_charge_id text,
  provider_transaction_id text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads — mesma estrutura já usada em src/data/leads.ts, agora persistida.
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest text,
  origin text not null,
  course_slug text,
  company text,
  status text not null default 'Novo' check (status in ('Novo', 'Contactado', 'Interessado', 'Inscrito', 'Convertido')),
  created_at timestamptz not null default now()
);

-- Row Level Security: cada aluno só vê os seus próprios dados.
-- O painel Admin usa a service role key (bypassa RLS) — nunca expor essa chave no browser.
alter table students enable row level security;
alter table enrollments enable row level security;
alter table certificates enable row level security;
alter table payments enable row level security;
alter table leads enable row level security;

create policy "Aluno vê o próprio registo" on students
  for select using (auth.uid() = auth_user_id);

create policy "Aluno vê as próprias inscrições" on enrollments
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy "Aluno vê os próprios certificados" on certificates
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy "Aluno vê os próprios pagamentos" on payments
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

-- Leads não são visíveis a alunos (só ao Admin, via service role key).
