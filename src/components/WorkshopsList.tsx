"use client";

import { useMemo, useState } from "react";
import WorkshopCard from "@/components/WorkshopCard";
import EmptyState from "@/components/EmptyState";
import { workshops } from "@/data/workshops";
import { trainingCategories } from "@/data/categories";

export default function WorkshopsList() {
  const [active, setActive] = useState<string>("Todos");

  const filtered = useMemo(() => {
    if (active === "Todos") return workshops;
    return workshops.filter((workshop) => workshop.category === active);
  }, [active]);

  const filters = ["Todos", ...trainingCategories];

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

      <div className="mt-12">
        {filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((workshop) => (
              <WorkshopCard key={workshop.slug} workshop={workshop} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sem workshops nesta categoria"
            description="Novas datas são anunciadas periodicamente. Contacte-nos para saber mais."
          />
        )}
      </div>
    </div>
  );
}
