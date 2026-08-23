"use client";

import { useMemo, useState, type ReactNode } from "react";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { staggerDelay } from "@/lib/reveal";
import { trainingCategories } from "@/data/categories";

// Recebe os cards já renderizados no servidor (via prop `items`) em vez de
// montar <CourseCard> aqui — CourseCard usa MediaSlot, que lê ficheiros do
// disco (node:fs) para encontrar a foto real, e isso só pode correr no
// servidor. Este componente só trata da busca e do filtro de categoria.
type Item = {
  slug: string;
  category: string;
  title: string;
  description?: string;
  node: ReactNode;
};

type Props = {
  items: Item[];
  initialCategory?: string;
};

export default function CoursesList({ items, initialCategory }: Props) {
  const [category, setCategory] = useState<string>(
    initialCategory && (trainingCategories as readonly string[]).includes(initialCategory)
      ? initialCategory
      : "Todos"
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === "Todos" || item.category === category;
      const matchesQuery =
        !q || item.title.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, items]);

  const categories = ["Todos", ...trainingCategories];

  return (
    <div className="grid gap-10 md:grid-cols-[260px_1fr]">
      <aside className="space-y-8">
        <div>
          <label htmlFor="formacoes-busca" className="sr-only">
            Procurar formação
          </label>
          <input
            id="formacoes-busca"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca"
            className="w-full rounded border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Categoria</p>
          <div className="mt-3 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                  category === cat ? "text-gold-dark" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    category === cat ? "border-gold" : "border-ink/25"
                  }`}
                  aria-hidden="true"
                >
                  {category === cat && <span className="h-2 w-2 rounded-full bg-gold" />}
                </span>
                {cat === "Todos" ? "Todas as categorias" : cat}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div>
        {items.length > 0 && (
          <p className="text-sm text-ink-soft">
            {filtered.length} {filtered.length === 1 ? "formação" : "formações"}
          </p>
        )}

        <div className="mt-6">
          {items.length === 0 ? (
            <EmptyState
              title="Formações a serem publicadas em breve"
              description="Estamos a preparar o catálogo de cursos. Contacte-nos para saber mais sobre as próximas formações."
            />
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((item, i) => (
                <Reveal key={item.slug} as="div" delay={staggerDelay(i)}>
                  {item.node}
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem formações para esta pesquisa"
              description="Experimente outra categoria ou outro termo de pesquisa. Contacte-nos para saber mais."
            />
          )}
        </div>
      </div>
    </div>
  );
}
