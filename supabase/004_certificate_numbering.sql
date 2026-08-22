-- Corre este ficheiro no SQL Editor do Supabase.
-- Gera automaticamente o número de certificado (ex.: WA-2026-0001) sempre
-- que uma linha é inserida em `certificates`, sem ser preciso indicar
-- certificate_number manualmente.

create sequence if not exists certificate_number_seq start 1;

create or replace function public.generate_certificate_number()
returns text
language sql
as $$
  select 'WA-' || to_char(current_date, 'YYYY') || '-' ||
         lpad(nextval('certificate_number_seq')::text, 4, '0');
$$;

alter table certificates
  alter column certificate_number set default public.generate_certificate_number();
