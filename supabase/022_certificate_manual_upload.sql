-- Corre este ficheiro no SQL Editor do Supabase.
-- Muda o fluxo de certificados: deixam de ser gerados automaticamente pelo
-- site quando o Admin marca uma inscrição como "Concluída". Passam a ser
-- o Admin a anexar manualmente a digitalização do certificado já impresso
-- e assinado pelo INEFOP — mesmo padrão já usado para as facturas
-- proformas (ver 016_payment_invoices.sql): o Admin faz upload via
-- /api/admin/inscricoes/[enrollmentId]/certificado, o aluno descarrega via
-- /api/aluno/certificados/[numero]/ficheiro (link temporário assinado).

alter table certificates
  add column if not exists file_path text,
  add column if not exists uploaded_at timestamptz;

-- Bucket privado (não público) — os certificados têm dados pessoais do
-- aluno. Todo o acesso passa sempre pelo servidor (service role), tal como
-- o bucket "facturas".
insert into storage.buckets (id, name, public)
values ('certificados', 'certificados', false)
on conflict (id) do nothing;
