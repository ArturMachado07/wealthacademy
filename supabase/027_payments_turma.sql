-- Corrige a lógica de pagamento das turmas: quem paga é a EMPRESA (pelo
-- mesmo mecanismo de Multicaixa/demo já usado pelos alunos), não o Admin a
-- "confirmar" um comprovativo à parte. `payments.student_id` já era
-- nullable — reaproveita-se a mesma tabela, só com company_id/turma_id
-- preenchidos em vez de student_id/enrollment_id.
alter table payments
  add column if not exists company_id uuid references companies(id) on delete set null,
  add column if not exists turma_id uuid references turmas(id) on delete set null;

-- Depois de paga, o Admin só anexa a factura (documento informativo, tal
-- como já acontece com os pagamentos individuais) — não activa nada.
alter table turmas add column if not exists invoice_uploaded_at timestamptz;
