export type Author = {
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
};

// Autores dos conteúdos de Wealth Insights. Estrutura pronta para vários
// autores — internos (equipa Wealth Academy) e externos (imprensa/convidados).
export const authors: Author[] = [
  {
    slug: "wealth-academy",
    name: "Wealth Academy",
    role: "Equipa Editorial",
  },
];
