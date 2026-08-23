-- Corre este ficheiro no SQL Editor do Supabase.
-- Foto de perfil do aluno, carregada directamente do dispositivo dele em
-- /aluno/perfil (ao contrário da foto de formadores/autores, que é um
-- ficheiro estático colocado manualmente em public/images pelo admin).

alter table students add column if not exists avatar_url text;

-- Bucket público — é só a foto de perfil do próprio aluno (baixa
-- sensibilidade, ao contrário das facturas), simplifica mostrar a imagem
-- directamente por URL sem gerar links assinados a cada carregamento de
-- página.
insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict (id) do nothing;
