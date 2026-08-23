"use client";

import { useMemo, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import type { InsightArticle } from "@/lib/wealth-insights";
import { insightCategories } from "@/data/categories";

type Props = {
  articles: InsightArticle[];
  initialCategory?: string;
};

export default function ArticlesList({ articles, initialCategory }: Props) {
  const [active, setActive] = useState<string>(
    initialCategory && (insightCategories as readonly string[]).includes(initialCategory)
      ? initialCategory
      : "Todos"
  );

  const filtered = useMemo(() => {
    if (active === "Todos") return articles;
    return articles.filter((article) => article.category === active);
  }, [active, articles]);

  const filters = ["Todos", ...insightCategories];

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              active === filter
                ? "border-gold bg-gold text-cream"
                : "border-ink/15 text-ink hover:border-gold"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-14">
        {filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : active === "Todos" ? (
          <EmptyState
            title="Os primeiros artigos estão a ser preparados"
            description="Em breve, análises e conteúdos sobre Finanças, Negócios e Mercado."
          />
        ) : (
          <EmptyState
            title="Sem artigos nesta categoria"
            description="Novos conteúdos são publicados periodicamente. Volte a visitar em breve."
          />
        )}
      </div>
    </div>
  );
}
