-- Corre este ficheiro no SQL Editor do Supabase.
-- schema.sql só permitia ao aluno VER as próprias inscrições (RLS de
-- select). Sem uma política de insert, o fluxo de auto-inscrição em
-- src/app/api/aluno/inscrever/route.ts falhava sempre (RLS bloqueava o
-- insert, mesmo com o aluno autenticado a criar a própria linha).

create policy "Aluno cria a própria inscrição" on enrollments
  for insert
  with check (
    student_id in (select id from students where auth_user_id = auth.uid())
  );
