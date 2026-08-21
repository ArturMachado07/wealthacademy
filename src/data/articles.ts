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

// Área editorial ainda sem artigos publicados.
export const articles: Article[] = [];
