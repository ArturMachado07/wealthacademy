-- Wealth Academy — permite ao aluno actualizar o próprio perfil (nome,
-- telefone). Corre no SQL Editor do Supabase depois de schema.sql.

create policy "Aluno actualiza o próprio registo" on students
  for update using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);
