import type { TrainingCategory } from "./categories";
import type { OfferingStatus } from "./courses";

export type Workshop = {
  slug: string;
  title: string;
  category: TrainingCategory;
  theme: string;
  date?: string;
  location?: string;
  instructor?: string;
  seats?: string;
  status: OfferingStatus;
  description?: string;
};

// Sem workshops confirmados ainda — a página exibe estado vazio até haver dados reais.
export const workshops: Workshop[] = [];
