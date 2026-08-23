-- Corre este ficheiro no SQL Editor do Supabase.
-- Torna /workshops uma galeria de flyers geridos pelo Admin, sem deploy: o
-- Admin carrega o flyer directamente do dispositivo dele (ao contrário dos
-- formadores/autores, cuja foto é um ficheiro estático em public/images) —
-- é o único conteúdo editorial do site que usa upload directo, precisamente
-- para permitir publicar um novo workshop sem intervenção técnica.
--
-- Substitui o catálogo estático (vazio) em src/data/workshops.ts.

create table if not exists workshops (
  slug text primary key,
  title text not null,
  category text,
  date text,
  location text,
  status text not null default 'Em breve'
    check (status in ('Em breve', 'Inscrições abertas', 'Esgotado', 'Realizado')),
  description text,
  registration_link text,
  flyer_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workshops enable row level security;

drop policy if exists "Qualquer pessoa vê workshops" on workshops;
create policy "Qualquer pessoa vê workshops" on workshops
  for select using (true);

-- Sem policies de insert/update/delete — só o Admin escreve, via service
-- role (bypassa RLS).

-- Bucket público — os flyers são material de marketing feito para ser
-- visível publicamente, tal como as fotos de perfil dos alunos (ao
-- contrário das facturas, que são privadas).
insert into storage.buckets (id, name, public)
values ('flyers', 'flyers', true)
on conflict (id) do nothing;
