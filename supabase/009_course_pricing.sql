-- Wealth Academy — preço/data de cada formação, editáveis pelo Admin sem
-- precisar de deploy. Os restantes dados do curso continuam em
-- src/data/courses.ts; esta tabela só sobrepõe "investment" e "date"
-- quando existir uma linha para o slug.

create table if not exists course_pricing (
  course_slug text primary key,
  investment text,
  date text,
  updated_at timestamptz not null default now()
);

alter table course_pricing enable row level security;

-- Preço/data são informação pública do catálogo — qualquer visitante
-- (mesmo sem sessão) precisa de conseguir lê-los nas páginas de formações.
create policy "Qualquer pessoa vê preços/datas" on course_pricing
  for select using (true);

-- Sem policy de insert/update/delete — só o Admin escreve, via service role
-- (bypassa RLS), a partir de /admin/formacoes/[slug].
