-- Corre este ficheiro no SQL Editor do Supabase.
-- Adiciona Convidado e Hora aos workshops.

alter table workshops add column if not exists guest text;
alter table workshops add column if not exists time text;
