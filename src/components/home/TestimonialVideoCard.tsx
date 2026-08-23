"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";

type Props = {
  name: string;
  subtitle: string;
  embedUrl: string;
  posterSrc: string | null;
};

// Nunca carrega o vídeo sozinho — só mostra a miniatura (extraída do
// próprio vídeo) com um botão de reproduzir. O vídeo (alojado no YouTube,
// não listado) só é pedido ao clicar, para não pesar o carregamento da home.
export default function TestimonialVideoCard({ name, subtitle, embedUrl, posterSrc }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded border border-ink/10 bg-white/60">
      <div className="relative aspect-video w-full bg-ink">
        {playing ? (
          <iframe
            src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Reproduzir testemunho de ${name}`}
            className="group relative h-full w-full"
          >
            {posterSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-ink/10" aria-hidden="true" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-ink/25 transition-colors group-hover:bg-ink/35">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-gold-dark shadow-lg">
                <PlayIcon className="h-6 w-6 translate-x-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-5">
        <p className="font-medium text-ink">{name}</p>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}
