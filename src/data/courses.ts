import type { TrainingCategory } from "./categories";

export type Modality = "Presencial" | "Online" | "Híbrido";
export type OfferingStatus = "Em breve" | "Inscrições abertas" | "Esgotado" | "Realizado";

export type Course = {
  slug: string;
  title: string;
  category: TrainingCategory;
  description: string;
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

// Nenhum curso foi fornecido ainda — estrutura pronta para ser alimentada via CMS/dados.
export const courses: Course[] = [];
