import type { insightCategories } from "./categories";

export type Article = {
  slug: string;
  title: string;
  category: (typeof insightCategories)[number];
  excerpt: string;
  authorSlug: string;
  date: string;
  readingTime?: string;
  photo?: string;
  body?: string[];
  // Preencher source/sourceUrl quando o conteúdo for cobertura de imprensa
  // (não original da Wealth Academy) — mostra a citação da publicação de origem.
  source?: string;
  sourceUrl?: string;
};

// Área editorial ainda sem artigos publicados — não criar artigos fictícios.
//
// Temas reais identificados (comunicados pela própria Wealth Academy) para
// desenvolver futuramente, quando houver texto definitivo:
// - Formar sem diagnóstico: por que muitas empresas não obtêm resultados
// - O desenvolvimento de competências como factor de crescimento das organizações
// - Formação técnica, comportamental ou executiva: qual a prioridade?
// - Mercado de Capitais: conhecimento técnico e aplicação prática
export const articles: Article[] = [
  {
    slug: "primeira-boutique-financeira-em-angola-aposta-no-desenvolvimento-do-sector",
    title: "Primeira Boutique Financeira em Angola aposta no desenvolvimento do sector",
    category: "Negócios",
    authorSlug: "wealth-academy",
    date: "31 de Março de 2025",
    photo: "boutiquefinanceira-2",
    excerpt:
      "A The Finance Boutique, apresentada como a primeira boutique financeira independente de Angola, foi lançada a 27 de Março de 2025, em Luanda, integrando a Wealth Academy como a sua unidade de formação profissional.",
    body: [
      "A The Finance Boutique, apresentada como a primeira boutique financeira independente de Angola, foi lançada a 27 de Março de 2025, em Luanda. A iniciativa integra a Wealth Academy como a sua unidade de formação profissional, dedicada à capacitação de profissionais do sector financeiro e de negócios.",
      "Segundo a fundadora e directora-geral, Mahália Castro, a empresa surge com novos formatos de formação para responder a lacunas identificadas no sector financeiro angolano, incluindo consultoria financeira especializada e soluções personalizadas para indivíduos, famílias e organizações de elevado património.",
      "No lançamento, o secretário de Estado para a Administração Pública, Domingos da Silva Filipe, destacou que a iniciativa ajuda a colmatar uma lacuna na formação especializada em finanças e negócios em Angola.",
    ],
    source: "Forbes África Lusófona",
    sourceUrl:
      "https://forbesafricalusofona.com/primeira-boutique-financeira-em-angola-aposta-no-desenvolvimento-do-sector/",
  },
];
