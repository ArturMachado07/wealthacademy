// NOTA: este ficheiro deixou de ser a fonte de dados do site — os autores
// agora vivem na tabela `insight_authors` do Supabase (ver
// supabase/010_wealth_insights.sql e src/lib/wealth-insights.ts), geridos
// via /admin/insights. Fica aqui só como registo histórico.
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
