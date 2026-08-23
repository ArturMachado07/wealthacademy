-- Corre este ficheiro no SQL Editor do Supabase.
-- Suporte para o admin anexar manualmente a factura (emitida no sistema de
-- facturação externo da empresa) a um pagamento já aceite, e o aluno a
-- descarregar depois em /aluno/pagamentos.

alter table payments
  add column if not exists invoice_path text,
  add column if not exists invoice_uploaded_at timestamptz;

-- Bucket privado (não público) — as facturas são documentos financeiros
-- pessoais. Todo o acesso passa sempre pelo servidor (service role): o
-- admin faz upload via /api/admin/pagamentos/[id]/factura, o aluno
-- descarrega via /api/aluno/pagamentos/[id]/factura (que confirma que o
-- pagamento é dele antes de gerar um link temporário assinado). Por isso
-- não são necessárias policies de storage para anon/authenticated.
insert into storage.buckets (id, name, public)
values ('facturas', 'facturas', false)
on conflict (id) do nothing;
