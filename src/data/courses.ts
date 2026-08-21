import type { TrainingCategory } from "./categories";

export type Modality = "Presencial" | "Online" | "Híbrido";
export type OfferingStatus = "Em breve" | "Inscrições abertas" | "Esgotado" | "Realizado";

export type Course = {
  slug: string;
  title: string;
  category: TrainingCategory;
  description?: string;
  image?: string;
  modality?: Modality;
  duration?: string;
  date?: string;
  status: OfferingStatus;
  objectives?: string[];
  audience?: string;
  syllabus?: string[];
  modules?: string[];
  location?: string;
  instructor?: string;
  followUp?: string;
  investment?: string;
  certification?: string;
  seats?: string;
  faq?: { question: string; answer: string }[];
};

// Catálogo real, fornecido pela Wealth Academy. Campos não confirmados ficam
// por preencher (não inventados) até haver informação oficial.
export const courses: Course[] = [
  {
    slug: "controlo-financeiro-pessoal",
    title: "Controlo Financeiro Pessoal",
    category: "Finanças",
    status: "Em breve",
    description:
      "Aprenda a gerir melhor os seus recursos financeiros, tomar decisões mais conscientes, evitar o endividamento e construir uma base mais sólida para o seu futuro financeiro. Uma formação orientada para quem pretende desenvolver hábitos e estratégias de gestão financeira pessoal.",
    objectives: [
      "Gerir melhor o dinheiro",
      "Evitar dívidas",
      "Começar a investir conscientemente",
      "Planear o futuro com estabilidade",
    ],
  },
  {
    slug: "fast-track-investidores",
    title: "Fast Track Investidores",
    category: "Finanças",
    status: "Em breve",
    description:
      "Uma introdução estruturada ao universo dos investimentos, desenvolvida para quem pretende começar do zero. Explore o mercado financeiro angolano, compreenda o seu perfil de investidor, avalie oportunidades e conheça os fundamentos para construir uma carteira de investimentos.",
    audience: "Adequada inclusive para quem começa sem experiência prévia em investimentos.",
  },
  {
    slug: "investimentos-analise-negociacao-mercado-capitais",
    title: "Investimentos, Análise e Negociação no Mercado de Capitais",
    category: "Finanças",
    status: "Em breve",
    description:
      "Desenvolva uma compreensão prática e estratégica do Mercado de Capitais, com uma abordagem que integra o contexto angolano, os mercados internacionais e os principais produtos financeiros globais. A formação inclui análise, pensamento crítico e simulações práticas de negociação.",
    audience: "Profissionais de investimento, tesouraria, gestão de activos e consultoria.",
    duration: "2 dias intensivos — conforme edição identificada",
    date: "28 de Fevereiro e 7 de Março",
    followUp: "6 meses de acompanhamento remoto — conforme edição identificada",
  },
  {
    slug: "comunicacao-institucional",
    title: "Comunicação Institucional",
    category: "Comunicação",
    status: "Em breve",
    instructor: "Dalila Prata",
    description:
      "Desenvolva competências para comunicar com estratégia, clareza e impacto no contexto institucional. O programa aborda a preparação de conferências de imprensa, organização de workshops institucionais, preparação de porta-vozes, relacionamento com os media e avaliação da comunicação. Metodologia prática e participativa.",
    syllabus: [
      "Preparação de conferências de imprensa",
      "Organização de workshops institucionais",
      "Preparação de porta-vozes",
      "Relacionamento com os media",
      "Avaliação da comunicação",
    ],
  },
  {
    slug: "powerpoint-intermedio-avancado",
    title: "PowerPoint Intermédio ao Avançado",
    category: "Tecnologia",
    status: "Em breve",
    duration: "10 horas",
  },
  {
    slug: "word-intermedio-avancado",
    title: "Word Intermédio ao Avançado",
    category: "Tecnologia",
    status: "Em breve",
    duration: "10 horas",
  },
];
