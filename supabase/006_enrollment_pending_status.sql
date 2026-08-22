-- Corre este ficheiro no SQL Editor do Supabase.
-- Prepara a tabela `enrollments` para o fluxo de pagamento: quando um
-- aluno inicia um pagamento (Multicaixa Express), a inscrição é criada
-- com estado "Pendente" e só passa a "Em curso" quando o webhook da
-- ProxyPay confirmar o pagamento (ver src/app/api/payments/webhook).

alter table enrollments drop constraint if exists enrollments_status_check;
alter table enrollments add constraint enrollments_status_check
  check (status in ('Pendente', 'Em curso', 'Concluída', 'Suspensa'));
