-- Corre este ficheiro no SQL Editor do Supabase DEPOIS do schema.sql.
-- Cria automaticamente um registo em `students` sempre que alguém se
-- regista via Supabase Auth (signUp), usando o nome passado em user
-- metadata (campo "name", enviado pelo formulário de registo).

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.students (auth_user_id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
