export type EventStatus = "Próximo" | "Inscrições abertas" | "Esgotado" | "Realizado";

export type WealthEvent = {
  slug: string;
  title: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  speakers?: string[];
  program?: string[];
  status: EventStatus;
  // Foto (nome-base em /public/images), corpo em parágrafos, detalhes em
  // pares label/valor e fonte — usados na página de detalhe do evento.
  photo?: string;
  body?: string[];
  details?: { label: string; value: string }[];
  source?: string;
  sourceUrl?: string;
};

export const events: WealthEvent[] = [
  {
    slug: "visita-biblioteca-nacional-de-angola",
    title: "Formandos da Wealth Academy realizam visita à Biblioteca Nacional de Angola",
    type: "Actividade Extracurricular",
    status: "Realizado",
    date: "6 de Fevereiro de 2026",
    location: "Biblioteca Nacional de Angola, Luanda",
    description:
      "Visita guiada à Biblioteca Nacional de Angola, no âmbito das actividades extracurriculares voltadas para o enriquecimento académico, cultural e intelectual dos formandos.",
    photo: "evento1-biblioteca-nacional",
    body: [
      "No passado 6 de Fevereiro do ano em curso, os formandos da Wealth Academy, academia de formação especializada em Finanças e Negócios, realizaram uma visita guiada à Biblioteca Nacional de Angola, no âmbito das actividades extracurriculares voltadas para o enriquecimento académico, cultural e intelectual dos seus estudantes.",
      "A iniciativa teve como principal objectivo aproximar os formandos do património bibliográfico nacional, promovendo o contacto directo com fontes de conhecimento histórico, científico e económico, fundamentais para a formação de profissionais mais completos e conscientes do contexto em que actuam.",
      "Durante a visita, os formandos tiveram a oportunidade de conhecer a história da Biblioteca Nacional de Angola, o seu vasto acervo documental, as áreas de consulta e preservação, bem como os serviços disponibilizados ao público. A actividade foi conduzida por técnicos da instituição, que prestaram esclarecimentos e destacaram o papel da biblioteca como centro de investigação, aprendizagem e conservação da memória colectiva do país.",
      "Para a Wealth Academy, a visita representou um momento de aprendizagem prática e reflexão sobre a importância do conhecimento, da leitura e da pesquisa no processo de tomada de decisões estratégicas no sector das finanças e dos negócios.",
      "Com esta iniciativa, a direcção da Wealth Academy reafirma o seu compromisso com uma formação integral, que alia competências técnicas à valorização da cultura, da educação contínua e da responsabilidade intelectual, contribuindo para a preparação de profissionais capazes de impulsionar o desenvolvimento económico e social de Angola.",
    ],
    details: [
      { label: "Data", value: "6 de Fevereiro de 2026" },
      { label: "Local", value: "Biblioteca Nacional de Angola, em Luanda" },
      { label: "Participantes", value: "Estudantes e formandos da Wealth Academy" },
      { label: "Foco", value: "Enriquecimento cultural, académico e contacto com fontes históricas e científicas" },
    ],
    source: "Biblioteca Nacional de Angola",
    sourceUrl: "https://ana.gov.ao/web/noticias/formandos-da-wealth-academy-realizam-visita-a-biblioteca-nacional-de-angola",
  },
];
