"use client";

import { useMemo, useState, type ReactNode } from "react";
import EmptyState from "@/components/EmptyState";
import { insightCategories } from "@/data/categories";

// Recebe os cards já renderizados no servidor (via prop `items`) em vez de
// montar <ArticleCard> aqui — ArticleCard usa MediaSlot, que lê ficheiros do
// disco (node:fs) para encontrar a foto real, e isso só pode correr no
// servidor. Este componente só trata do estado do filtro.
type Item = { slug: string; category: string; node: ReactNode };

type Props = {
  items: Item[];
  initialCategory?: string;
};

export default function ArticlesList({ items, initialCategory }: Props) {
  const [active, setActive] = useState<string>(
    initialCategory && (insightCategories as readonly string[]).includes(initialCategory)
      ? initialCategory
      : "Todos"
  );

  const filtered = useMemo(() => {
    if (active === "Todos") return items;
    return items.filter((item) => item.category === active);
  }, [active, items]);

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
            {filtered.map((item) => (
              <div key={item.slug}>{item.node}</div>
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
