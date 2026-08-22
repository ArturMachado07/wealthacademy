"use client";

import { useState } from "react";
import Image from "next/image";

type Slide = { key: string; label: string; src: string | null };

type Props = {
  title: string;
  slides: Slide[];
};

// Caixa do curso com 3 slides (Capa, Benefícios, Formadores). Recebe os
// URLs já resolvidos pelo Server Component (formacoes/[slug]/page.tsx),
// que é quem sabe procurar ficheiros em /public/images — este componente
// é "use client" (por causa das setas) e não pode usar fs/path do Node.
export default function CourseSlideshow({ title, slides }: Props) {
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
      <div className="relative aspect-[4/3] w-full">
        {slide.src ? (
          <Image
            src={slide.src}
            alt={`${title} — ${slide.label}`}
            fill
            sizes="(min-width: 768px) 600px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-ink" aria-hidden="true">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, #C79A5D 0, transparent 50%), radial-gradient(circle at 75% 75%, #C79A5D 0, transparent 45%)",
              }}
            />
          </div>
        )}
      </div>

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
