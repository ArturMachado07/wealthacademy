import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { getArticles } from "@/lib/wealth-insights";
import { insightCategories } from "@/data/categories";

export const metadata: Metadata = {
  title: "Wealth Insights",
  description: "Área editorial da Wealth Academy sobre Finanças, Negócios, Gestão, Liderança e Mercado.",
};

export const dynamic = "force-dynamic";

export default async function WealthInsightsPage() {
  const articles = await getArticles();

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Wealth Insights"
          title="Conhecimento em Finanças e Negócios"
          description="Artigos e análises sobre os temas que movem o mercado angolano."
        />

        <div className="mt-10 flex flex-wrap gap-3">
          {insightCategories.map((category) => (
            <span key={category} className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink">
              {category}
            </span>
          ))}
        </div>

        <div className="mt-14">
          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Os primeiros artigos estão a ser preparados"
              description="Em breve, análises e conteúdos sobre Finanças, Negócios e Mercado."
            />
          )}
        </div>
      </div>
    </section>
  );
}
