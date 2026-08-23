import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ArticleCard from "@/components/ArticleCard";
import ArticlesList from "@/components/ArticlesList";
import { getArticles } from "@/lib/wealth-insights";

export const metadata: Metadata = {
  title: "Wealth Insights",
  description: "Área editorial da Wealth Academy sobre Finanças, Negócios, Gestão, Liderança e Mercado.",
};

export const dynamic = "force-dynamic";

export default async function WealthInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const articles = await getArticles();

  // ArticleCard usa MediaSlot (leitura de ficheiros no servidor) — é
  // renderizado aqui, no servidor, e só o nó já pronto é passado ao
  // componente de filtro no cliente.
  const items = articles.map((article) => ({
    slug: article.slug,
    category: article.category,
    node: <ArticleCard article={article} />,
  }));

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Wealth Insights"
          title="Conhecimento em Finanças e Negócios"
          description="Artigos e análises sobre os temas que movem o mercado angolano."
        />

        <div className="mt-10">
          <ArticlesList items={items} initialCategory={categoria} />
        </div>
      </div>
    </section>
  );
}
