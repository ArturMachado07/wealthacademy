"use client";

import { useState } from "react";
import MediaSlot from "@/components/MediaSlot";

type Props = {
  slug: string;
  title: string;
};

// Caixa do curso com 3 slides: Capa, Benefícios, Formadores. Cada slide
// mostra a imagem real assim que existir em /public/images com o nome
// indicado (mesmo padrão do MediaSlot) — até lá, mostra o painel
// gráfico discreto.
export default function CourseSlideshow({ slug, title }: Props) {
  const slides = [
    { key: "capa", label: "Capa", baseName: `curso-${slug}-1-capa` },
    { key: "beneficios", label: "Benefícios", baseName: `curso-${slug}-2-beneficios` },
    { key: "formadores", label: "Formadores", baseName: `curso-${slug}-3-formadores` },
  ];
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div className="relative overflow-hidden rounded border border-ink/10">
      <MediaSlot
        baseName={slide.baseName}
        alt={`${title} — ${slide.label}`}
        className="aspect-[4/3] w-full"
        sizes="(min-width: 768px) 600px, 100vw"
      />

      <span className="absolute left-3 top-3 rounded bg-ink/70 px-2 py-1 text-xs text-cream">
        {slide.label}
      </span>

      <button
        type="button"
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink hover:bg-white"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide seguinte"
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink hover:bg-white"
      >
        ›
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-gold" : "bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
