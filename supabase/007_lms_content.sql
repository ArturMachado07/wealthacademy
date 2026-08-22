-- Wealth Academy — Conteúdo do LMS (módulos, aulas, progresso).
-- Corre no SQL Editor do Supabase depois de schema.sql.

-- Módulos de uma formação (course_slug vem de src/data/courses.ts).
create table if not exists course_modules (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Aulas dentro de um módulo.
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references course_modules(id) on delete cascade,
  title text not null,
  description text,
  video_provider text not null default 'youtube' check (video_provider in ('youtube', 'vimeo', 'direct')),
  video_url text,
  materials_url text,
  duration_minutes int,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Progresso do aluno: uma linha por aula concluída.
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

alter table course_modules enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;

-- Só alunos com inscrição activa/concluída nessa formação veem os módulos.
create policy "Aluno inscrito vê módulos" on course_modules
  for select using (
    exists (
      select 1 from enrollments e
      join students s on s.id = e.student_id
      where s.auth_user_id = auth.uid()
        and e.course_slug = course_modules.course_slug
        and e.status in ('Em curso', 'Concluída')
    )
  );

-- Idem para as aulas (via módulo -> curso -> inscrição).
create policy "Aluno inscrito vê aulas" on lessons
  for select using (
    exists (
      select 1 from course_modules m
      join enrollments e on e.course_slug = m.course_slug
      join students s on s.id = e.student_id
      where m.id = lessons.module_id
        and s.auth_user_id = auth.uid()
        and e.status in ('Em curso', 'Concluída')
    )
  );

-- Progresso: cada aluno só vê/regista/remove o seu próprio.
create policy "Aluno vê o próprio progresso" on lesson_progress
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy "Aluno regista o próprio progresso" on lesson_progress
  for insert with check (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy "Aluno remove o próprio progresso" on lesson_progress
  for delete using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

-- Não há policy de insert/update/delete para course_modules/lessons —
-- só o painel Admin (service role, bypassa RLS) pode escrever conteúdo.
