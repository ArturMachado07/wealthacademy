-- Wealth Academy — Wealth Insights (autores e artigos) editável pelo Admin,
-- sem precisar de deploy. Substitui src/data/authors.ts e
-- src/data/articles.ts como fonte de verdade (esses ficheiros ficam só de
-- referência histórica no repositório).

create table if not exists insight_authors (
  slug text primary key,
  name text not null,
  role text,
  bio text,
  photo text,
  created_at timestamptz not null default now()
);

create table if not exists insight_articles (
  slug text primary key,
  title text not null,
  category text not null,
  excerpt text not null,
  author_slug text not null references insight_authors(slug) on delete restrict,
  date text not null,
  reading_time text,
  photo text,
  gallery text[],
  body text[],
  source text,
  source_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table insight_authors enable row level security;
alter table insight_articles enable row level security;

-- Autores e artigos publicados são conteúdo público do site.
create policy "Qualquer pessoa vê autores" on insight_authors
  for select using (true);

create policy "Qualquer pessoa vê artigos publicados" on insight_articles
  for select using (published = true);

-- Sem policies de insert/update/delete — só o Admin escreve, via service
-- role (bypassa RLS, incluindo para ver rascunhos não publicados).

-- Seed: autor e artigo reais já existentes no site (copiados tal e qual de
-- src/data/authors.ts e src/data/articles.ts — não inventados).
insert into insight_authors (slug, name, role)
values ('wealth-academy', 'Wealth Academy', 'Equipa Editorial')
on conflict (slug) do nothing;

insert into insight_articles (
  slug, title, category, excerpt, author_slug, date, photo, gallery, body, source, source_url
)
values (
  'primeira-boutique-financeira-em-angola-aposta-no-desenvolvimento-do-sector',
  'Primeira Boutique Financeira em Angola aposta no desenvolvimento do sector',
  'Negócios',
  'A The Finance Boutique, apresentada como a primeira boutique financeira independente de Angola, foi lançada a 27 de Março de 2025, em Luanda, integrando a Wealth Academy como a sua unidade de formação profissional.',
  'wealth-academy',
  '31 de Março de 2025',
  'boutiquefinanceira-1',
  array['boutiquefinanceira-2', 'boutiquefinanceira-3'],
  array[
    'A The Finance Boutique, apresentada como a primeira boutique financeira independente de Angola, foi lançada a 27 de Março de 2025, em Luanda. A iniciativa integra a Wealth Academy como a sua unidade de formação profissional, dedicada à capacitação de profissionais do sector financeiro e de negócios.',
    'Segundo a fundadora e directora-geral, Mahália Castro, a empresa surge com novos formatos de formação para responder a lacunas identificadas no sector financeiro angolano, incluindo consultoria financeira especializada e soluções personalizadas para indivíduos, famílias e organizações de elevado património.',
    'No lançamento, o secretário de Estado para a Administração Pública, Domingos da Silva Filipe, destacou que a iniciativa ajuda a colmatar uma lacuna na formação especializada em finanças e negócios em Angola.'
  ],
  'Forbes África Lusófona',
  'https://forbesafricalusofona.com/primeira-boutique-financeira-em-angola-aposta-no-desenvolvimento-do-sector/'
)
on conflict (slug) do nothing;
