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
};

export const events: WealthEvent[] = [
  {
    slug: "lancamento-oficial-wealth-academy",
    title: "Lançamento Oficial da Wealth Academy",
    type: "Evento Institucional",
    status: "Realizado",
    description:
      "Evento institucional que marcou o lançamento da The Finance Boutique – Wealth Management & Advisory Services, Lda e da sua unidade de capacitação, a Wealth Academy.",
  },
];
