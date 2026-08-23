-- Wealth Academy — torna a página de cada formação editável pelo Admin sem
-- deploy (título, descrição, carga horária, admissão, data, local,
-- certificação, inclui, banner, preço), e adiciona um directório de
-- Formadores (à semelhança dos Autores do Wealth Insights): perfil global
-- com foto/cargo/bio, ligado às formações que lecciona.
--
-- Os módulos do curso (programa) continuam a viver só em
-- src/data/courses.ts — não ficam editáveis pelo Admin.

-- A tabela course_pricing já existia (só investment/date) — alarga-se aqui
-- para cobrir o resto do conteúdo "de marketing" da página do curso.
alter table course_pricing add column if not exists title text;
alter table course_pricing add column if not exists description text;
alter table course_pricing add column if not exists duration text;
alter table course_pricing add column if not exists admission text;
alter table course_pricing add column if not exists location text;
alter table course_pricing add column if not exists certification text;
alter table course_pricing add column if not exists extras text[];
alter table course_pricing add column if not exists image text;

-- Formadores — perfil global (uma pessoa pode leccionar mais do que uma
-- formação), tal como os autores do Wealth Insights.
create table if not exists instructors (
  slug text primary key,
  name text not null,
  role text,
  bio text,
  photo text,
  created_at timestamptz not null default now()
);

alter table instructors enable row level security;

create policy "Qualquer pessoa vê formadores" on instructors
  for select using (true);

-- Liga formadores a formações (muitos-para-muitos). course_slug não tem
-- foreign key porque as formações em si não vivem numa tabela — só o seu
-- conteúdo editável (course_pricing) e, agora, os formadores ligados.
create table if not exists course_instructors (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  instructor_slug text not null references instructors(slug) on delete restrict,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (course_slug, instructor_slug)
);

alter table course_instructors enable row level security;

create policy "Qualquer pessoa vê formadores de cada formação" on course_instructors
  for select using (true);

-- Sem policies de insert/update/delete em nenhuma das tabelas — só o Admin
-- escreve, via service role (bypassa RLS).

-- Seed: os 2 formadores já existentes em src/data/courses.ts (não
-- inventados — copiados tal e qual), ligados à formação onde já apareciam.
insert into instructors (slug, name, role)
values
  ('lombe-caculo', 'Lombe Caculo', 'Consultor de Investimentos e Analista Financeiro Independente'),
  ('mahalia-castro-formador', 'Mahália Castro', 'Consultora de Investimentos e Analista Financeira Independente')
on conflict (slug) do nothing;

insert into course_instructors (course_slug, instructor_slug, position)
values
  ('analise-negociacao-mercado-capitais', 'lombe-caculo', 0),
  ('analise-negociacao-mercado-capitais', 'mahalia-castro-formador', 1)
on conflict (course_slug, instructor_slug) do nothing;
