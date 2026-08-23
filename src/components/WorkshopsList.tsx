"use client";

import { useMemo, useState } from "react";
import WorkshopCard from "@/components/WorkshopCard";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { staggerDelay } from "@/lib/reveal";
import type { Workshop } from "@/lib/workshops";

const FILTERS = ["Todos", "Próximos", "Realizados"] as const;
type Filter = (typeof FILTERS)[number];

function isUpcoming(workshop: Workshop) {
  return workshop.status !== "Realizado";
}

export default function WorkshopsList({ workshops }: { workshops: Workshop[] }) {
  const [active, setActive] = useState<Filter>("Todos");

  const filtered = useMemo(() => {
    if (active === "Próximos") return workshops.filter(isUpcoming);
    if (active === "Realizados") return workshops.filter((w) => !isUpcoming(w));
    return workshops;
  }, [active, workshops]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => (
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((workshop, i) => (
              <Reveal key={workshop.slug} as="div" delay={staggerDelay(i)}>
                <WorkshopCard workshop={workshop} />
              </Reveal>
            ))}
          </div>
        ) : active === "Todos" ? (
          <EmptyState
            eyebrow="Workshops e experiências práticas"
            title="A Wealth Academy desenvolve experiências de aprendizagem orientadas para desafios concretos de profissionais e organizações."
            description="Novas experiências serão anunciadas brevemente."
          />
        ) : (
          <EmptyState
            title={active === "Próximos" ? "Sem workshops próximos" : "Sem workshops realizados"}
            description="Novas datas são anunciadas periodicamente. Contacte-nos para saber mais."
          />
        )}
      </div>
    </div>
  );
}
