-- Wealth Academy — Avaliações/testes do LMS (por aula).
-- Corre no SQL Editor do Supabase depois de 007_lms_content.sql.

create table if not exists lesson_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references lessons(id) on delete cascade,
  passing_score int not null default 70 check (passing_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references lesson_quizzes(id) on delete cascade,
  question text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  position int not null default 0
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  quiz_id uuid not null references lesson_quizzes(id) on delete cascade,
  score int not null check (score between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);

alter table lesson_quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table quiz_attempts enable row level security;

-- Propositadamente SEM policy de select em lesson_quizzes/quiz_questions/
-- quiz_options: se um aluno pudesse ler quiz_options directamente (mesmo só
-- com policy de select), o campo is_correct ficaria visível na aba de rede
-- do browser antes de responder. Por isso o aluno nunca lê estas tabelas
-- directamente — a página da aula usa o service role no servidor para
-- montar as perguntas SEM o campo is_correct, e a correcção acontece
-- inteiramente no servidor (ver /api/aluno/quiz-attempt). Só o Admin
-- (service role) lê/escreve estas três tabelas.

-- quiz_attempts: o aluno só vê e regista as suas próprias tentativas
-- (nunca as respostas correctas, só a pontuação final).
create policy "Aluno vê as próprias tentativas" on quiz_attempts
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy "Aluno regista a própria tentativa" on quiz_attempts
  for insert with check (
    student_id in (select id from students where auth_user_id = auth.uid())
  );
