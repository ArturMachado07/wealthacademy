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
  },
  {
    slug: "fast-track-investidores",
    title: "Fast Track Investidores",
    category: "Finanças",
    status: "Em breve",
  },
  {
    slug: "investimentos-analise-negociacao-mercado-capitais",
    title: "Investimentos, Análise e Negociação no Mercado de Capitais",
    category: "Finanças",
    status: "Em breve",
    duration: "2 dias intensivos",
    date: "28 de Fevereiro e 7 de Março",
  },
  {
    slug: "comunicacao-institucional",
    title: "Comunicação Institucional",
    category: "Comunicação",
    status: "Em breve",
    instructor: "Dalila Prata",
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
