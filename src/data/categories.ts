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
  "Liderança",
  "Comunicação",
  "Tecnologia",
  "Desenvolvimento Profissional",
  "Formação Corporativa",
] as const;
