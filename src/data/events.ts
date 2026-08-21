export type EventStatus = "Próximo" | "Inscrições abertas" | "Esgotado" | "Realizado";

export type WealthEvent = {
  slug: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  speakers?: string[];
  program?: string[];
  status: EventStatus;
};

// Sem eventos confirmados ainda.
export const events: WealthEvent[] = [];
