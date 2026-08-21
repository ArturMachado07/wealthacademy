// Categorias editáveis via CMS — não é uma lista fechada de cursos.
export const trainingCategories = [
  "Finanças",
  "Negócios",
  "Gestão",
  "Liderança",
  "Comunicação",
  "Desenvolvimento Profissional",
  "Tecnologia",
] as const;

export type TrainingCategory = (typeof trainingCategories)[number];

export const insightCategories = [
  "Finanças",
  "Negócios",
  "Gestão",
  "Liderança",
  "Carreira",
  "Mercado",
  "Educação Financeira",
] as const;
