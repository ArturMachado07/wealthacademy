-- Wealth Academy — adiciona ao Wealth Insights o artigo sobre a visita à
-- Biblioteca Nacional de Angola (antes publicado como evento em /eventos,
-- página agora removida). Categoria "Formação Corporativa", autor
-- "Wealth Academy" (autor já existente, seed em 010_wealth_insights.sql).

insert into insight_articles (
  slug, title, category, excerpt, author_slug, date, photo, body, source, source_url
)
values (
  'visita-biblioteca-nacional-de-angola',
  'Formandos da Wealth Academy realizam visita à Biblioteca Nacional de Angola',
  'Formação Corporativa',
  'Visita guiada à Biblioteca Nacional de Angola, no âmbito das actividades extracurriculares voltadas para o enriquecimento académico, cultural e intelectual dos formandos.',
  'wealth-academy',
  '6 de Fevereiro de 2026',
  'evento1-biblioteca-nacional',
  array[
    'No passado 6 de Fevereiro do ano em curso, os formandos da Wealth Academy, academia de formação especializada em Finanças e Negócios, realizaram uma visita guiada à Biblioteca Nacional de Angola, no âmbito das actividades extracurriculares voltadas para o enriquecimento académico, cultural e intelectual dos seus estudantes.',
    'A iniciativa teve como principal objectivo aproximar os formandos do património bibliográfico nacional, promovendo o contacto directo com fontes de conhecimento histórico, científico e económico, fundamentais para a formação de profissionais mais completos e conscientes do contexto em que actuam.',
    'Durante a visita, os formandos tiveram a oportunidade de conhecer a história da Biblioteca Nacional de Angola, o seu vasto acervo documental, as áreas de consulta e preservação, bem como os serviços disponibilizados ao público. A actividade foi conduzida por técnicos da instituição, que prestaram esclarecimentos e destacaram o papel da biblioteca como centro de investigação, aprendizagem e conservação da memória colectiva do país.',
    'Para a Wealth Academy, a visita representou um momento de aprendizagem prática e reflexão sobre a importância do conhecimento, da leitura e da pesquisa no processo de tomada de decisões estratégicas no sector das finanças e dos negócios.',
    'Com esta iniciativa, a direcção da Wealth Academy reafirma o seu compromisso com uma formação integral, que alia competências técnicas à valorização da cultura, da educação contínua e da responsabilidade intelectual, contribuindo para a preparação de profissionais capazes de impulsionar o desenvolvimento económico e social de Angola.'
  ],
  'Biblioteca Nacional de Angola',
  'https://ana.gov.ao/web/noticias/formandos-da-wealth-academy-realizam-visita-a-biblioteca-nacional-de-angola'
)
on conflict (slug) do nothing;
