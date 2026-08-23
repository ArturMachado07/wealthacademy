import type { TrainingCategory } from "./categories";

export type Modality = "Presencial" | "Online" | "Híbrido";
export type OfferingStatus = "Em breve" | "Inscrições abertas" | "Esgotado" | "Realizado";

export type Course = {
  slug: string;
  title: string;
  category: TrainingCategory;
  description?: string;
  // Resumo curto para o card de listagem (/formacoes). Se não for definido,
  // o card usa um excerto automático de `description`.
  summary?: string;
  image?: string;
  modality?: Modality;
  duration?: string;
  date?: string;
  status: OfferingStatus;
  objectives?: string[];
  audience?: string;
  syllabus?: string[];
  // Módulos do curso (título + descrição curta), mostrados na secção "O que
  // vai aprender" da página da formação.
  modules?: { title: string; description: string }[];
  location?: string;
  // Um único formador (texto livre) — usado quando só há um nome, sem cargo.
  instructor?: string;
  // Vários formadores com cargo/função — usado na secção "Formadores" da
  // página da formação quando há mais do que um, ou quando queremos indicar
  // o cargo de cada um.
  instructors?: { name: string; role: string }[];
  followUp?: string;
  // Critério de admissão/vagas (ex.: "Admissão por ordem de inscrição").
  admission?: string;
  investment?: string;
  certification?: string;
  seats?: string;
  // Informações extra e curtas sobre a formação (ex.: "Coffee Break e
  // Almoço"), mostradas como "Inclui" no bloco de detalhes da página do curso.
  extras?: string[];
  faq?: { question: string; answer: string }[];
};

// Catálogo real, fornecido pela Wealth Academy. Campos não confirmados ficam
// por preencher (não inventados) até haver informação oficial.
//
// PREÇOS (campo `investment`): valores DEMO fornecidos explicitamente para
// testar o sistema de checkout — NÃO são os preços oficiais da Wealth
// Academy. Substituir por valores reais antes do lançamento público (ver
// SETUP-ALUNO-PAGAMENTOS.md, secção de pagamentos).
export const courses: Course[] = [
  {
    slug: "controlo-financeiro-pessoal",
    title: "Controlo Financeiro Pessoal",
    category: "Finanças",
    status: "Em breve",
    investment: "75.000 Kz",
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
    investment: "120.000 Kz",
    description:
      "Uma introdução estruturada ao universo dos investimentos, desenvolvida para quem pretende começar do zero. Explore o mercado financeiro angolano, compreenda o seu perfil de investidor, avalie oportunidades e conheça os fundamentos para construir uma carteira de investimentos.",
    audience: "Adequada inclusive para quem começa sem experiência prévia em investimentos.",
  },
  {
    slug: "investimentos-analise-negociacao-mercado-capitais",
    title: "Análise e Negociação no Mercado de Capitais",
    category: "Finanças",
    image: "banner_formação-investimentos-capitais",
    status: "Em breve",
    investment: "85.000 Kz",
    summary: "Do local ao internacional. Eleve o seu posicionamento no mercado financeiro.",
    description:
      "A Wealth Academy promove uma formação intensiva para quem pretende elevar o seu posicionamento no mercado financeiro e actuar com maior confiança e estratégia.",
    audience: "Profissionais de investimento, tesouraria, gestão de activos e consultoria.",
    duration: "20h",
    date: "28 de Fevereiro e 7 de Março",
    admission: "Admissão por ordem de inscrição",
    location: "Luanda | Hotel EPIC SANA",
    certification: "Certificado reconhecido pelo INEFOP",
    extras: ["Coffee Break e Almoço"],
    modules: [
      {
        title: "Módulo 1 - Estrutura do Sistema Financeiro",
        description:
          "Compreenda o ecossistema financeiro angolano e as ligações estratégicas com padrões internacionais.",
      },
      {
        title: "Módulo 2 - Mercado de Capitais e Produtos",
        description:
          "Identifique oportunidades em Angola e no exterior, dominando instrumentos financeiros e mercados primário e secundário.",
      },
      {
        title: "Módulo 3 - Análise e Gestão de Risco",
        description:
          "Avalie activos e implemente estratégias de risco que funcionam tanto no contexto nacional como internacional.",
      },
      {
        title: "Módulo 4 - Psicologia do Investidor",
        description:
          "Entenda os comportamentos que movem investidores em Angola e nos mercados internacionais para decisões mais assertivas.",
      },
      {
        title: "Módulo 5 – Simulações de Negociação",
        description: "Pratique negociação real, aplicando técnicas que funcionam em salas de mercados locais e internacionais.",
      },
    ],
    instructors: [
      { name: "Lombe Caculo", role: "Consultor de Investimentos e Analista Financeiro Independente" },
      { name: "Mahália Castro", role: "Consultora de Investimentos e Analista Financeira Independente" },
    ],
  },
  {
    slug: "comunicacao-institucional",
    title: "Comunicação Institucional, Workshops e Conferências de Imprensa",
    category: "Comunicação",
    status: "Em breve",
    instructor: "Dalila Prata",
    investment: "65.000 Kz",
    description:
      "Desenvolva competências para comunicar de forma estratégica, clara e eficaz no contexto institucional. A formação aborda a organização de workshops e conferências de imprensa, preparação de porta-vozes, relacionamento com os media e aplicação prática de técnicas de comunicação profissional, com exercícios e dinâmicas orientados para situações reais do contexto profissional.",
    syllabus: [
      "Comunicação institucional",
      "Organização de workshops institucionais",
      "Diferença entre workshop, palestra, fórum e conferência",
      "Planeamento e execução de conferências de imprensa",
      "Preparação de porta-vozes",
      "Relação com os media",
      "Avaliação do impacto da comunicação",
    ],
  },
  {
    slug: "powerpoint-intermedio-avancado",
    title: "PowerPoint Intermédio ao Avançado",
    category: "Tecnologia",
    status: "Em breve",
    duration: "10 horas",
    investment: "55.000 Kz",
    description:
      "Desenvolva competências para criar apresentações profissionais mais claras, apelativas e impactantes. A formação aborda princípios de design e comunicação visual, estruturação de apresentações, utilização estratégica de animações e transições, integração de elementos gráficos e multimédia e adaptação da apresentação a diferentes públicos.",
  },
  {
    slug: "word-intermedio-avancado",
    title: "Word Intermédio ao Avançado",
    category: "Tecnologia",
    status: "Em breve",
    duration: "10 horas",
    investment: "50.000 Kz",
    description:
      "Desenvolva competências avançadas para criar e gerir documentos profissionais com maior rigor e eficiência. A formação inclui formatação avançada, estruturação de documentos longos com estilos, criação de índices e referências automáticas, ferramentas de revisão e colaboração e automatização de tarefas para aumentar a produtividade.",
  },
];
