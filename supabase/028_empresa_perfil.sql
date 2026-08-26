-- Wealth Academy — perfil da empresa (logo + edição de dados), mesmo
-- padrão de 008_student_profile_update.sql e 017_student_avatar.sql para o
-- aluno. Corre no SQL Editor do Supabase depois de 026_companies_turmas.sql.

alter table companies add column if not exists logo_url text;

-- Bucket público — logótipo da empresa (baixa sensibilidade, ao contrário
-- das facturas), mesma lógica do bucket "avatares" do aluno.
insert into storage.buckets (id, name, public)
values ('logos-empresas', 'logos-empresas', true)
on conflict (id) do nothing;

drop policy if exists "Empresa actualiza o próprio registo" on companies;
create policy "Empresa actualiza o próprio registo" on companies
  for update using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);
