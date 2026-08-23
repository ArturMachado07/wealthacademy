"use client";

import { useMemo, useState, type ReactNode } from "react";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { FilterIcon } from "@/components/icons";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    <div>
      <div>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink hover:border-gold"
        >
          <FilterIcon className="h-4 w-4" />
          Filtrar
        </button>
      </div>

      <div className={`${filtersOpen ? "mt-4 flex" : "hidden"} flex-col gap-4 sm:flex-row sm:items-center`}>
        <div className="md:w-64 md:shrink-0">
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

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                category === cat
                  ? "border-gold bg-gold text-cream"
                  : "border-ink/15 text-ink hover:border-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
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
