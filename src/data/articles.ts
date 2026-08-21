import type { insightCategories } from "./categories";

export type Article = {
  slug: string;
  title: string;
  category: (typeof insightCategories)[number];
  excerpt: string;
  author: string;
  date: string;
  readingTime: string;
};

// Área editorial ainda sem artigos publicados — não criar artigos fictícios.
//
// Temas reais identificados (comunicados pela própria Wealth Academy) para
// desenvolver futuramente, quando houver texto definitivo:
// - Formar sem diagnóstico: por que muitas empresas não obtêm resultados
// - O desenvolvimento de competências como factor de crescimento das organizações
// - Formação técnica, comportamental ou executiva: qual a prioridade?
// - Mercado de Capitais: conhecimento técnico e aplicação prática
export const articles: Article[] = [];
