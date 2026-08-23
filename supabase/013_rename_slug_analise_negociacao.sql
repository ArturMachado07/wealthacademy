-- Wealth Academy — o curso "Análise e Negociação no Mercado de Capitais"
-- mudou de slug em src/data/courses.ts:
--   investimentos-analise-negociacao-mercado-capitais
--   → analise-negociacao-mercado-capitais
-- Quem já tinha inscrição feita com o slug antigo precisa desta migração
-- para continuar ligado ao curso certo (senão o curso "desaparece" de
-- /aluno, porque o slug guardado deixa de bater certo com o catálogo).

update enrollments
set course_slug = 'analise-negociacao-mercado-capitais',
    course_title = 'Análise e Negociação no Mercado de Capitais',
    updated_at = now()
where course_slug = 'investimentos-analise-negociacao-mercado-capitais';

update leads
set course_slug = 'analise-negociacao-mercado-capitais'
where course_slug = 'investimentos-analise-negociacao-mercado-capitais';

update course_pricing
set course_slug = 'analise-negociacao-mercado-capitais'
where course_slug = 'investimentos-analise-negociacao-mercado-capitais';

update course_modules
set course_slug = 'analise-negociacao-mercado-capitais'
where course_slug = 'investimentos-analise-negociacao-mercado-capitais';
