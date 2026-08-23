-- Corre este ficheiro no SQL Editor do Supabase.
-- Muda o formato do número do certificado de WA-AAAA-NNNN (ex.: WA-2026-0005)
-- para WACA-MESANO-NNNN (ex.: WACA-AGO26-0005) — mês em português (3
-- letras) + ano com 2 dígitos. A sequência (NNNN) nunca reinicia; só o
-- prefixo muda sozinho consoante o mês/ano de cada novo certificado.

create or replace function public.generate_certificate_number()
returns text
language plpgsql
as $$
declare
  meses text[] := array['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  mes text := meses[extract(month from current_date)::int];
  ano text := to_char(current_date, 'YY');
begin
  return 'WACA-' || mes || ano || '-' || lpad(nextval('certificate_number_seq')::text, 4, '0');
end;
$$;

-- Renumeia os certificados já emitidos no formato antigo (preserva o
-- número de sequência, só reformata o prefixo a partir da data real de
-- emissão de cada um).
update certificates
set certificate_number = 'WACA-' ||
  (array['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'])[extract(month from issue_date)::int] ||
  to_char(issue_date, 'YY') || '-' ||
  regexp_replace(certificate_number, '^WA-\d{4}-', '')
where certificate_number like 'WA-%' and certificate_number not like 'WACA-%';
