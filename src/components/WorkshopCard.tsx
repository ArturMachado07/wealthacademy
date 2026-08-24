import Link from "next/link";
import Image from "next/image";
import type { Workshop } from "@/lib/workshops";

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const isPast = workshop.status === "Realizado";

  return (
    <Link
      href={`/workshops/${workshop.slug}`}
      className="group flex flex-col overflow-hidden rounded border border-ink/10 bg-white/60 transition-colors hover:border-gold"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink/5">
        {workshop.flyer_url ? (
          // Vem do bucket público do Supabase Storage — remotePatterns já
          // configurado em next.config.mjs. O contentedor precisa de
          // "relative" explícito para o `fill` funcionar (ver Hero.tsx: um
          // container sem posição definida colapsa a imagem a zero altura).
          <Image
            src={workshop.flyer_url}
            alt={workshop.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover transition-transform group-hover:scale-[1.02] ${
              isPast ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="eyebrow">{workshop.category ?? "Workshop"}</span>
            <p className="text-sm font-medium text-ink">{workshop.title}</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {workshop.category && (
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">{workshop.category}</span>
          )}
          <span className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink-soft">
            {workshop.status}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-medium text-ink">{workshop.title}</h3>

        {workshop.description && <p className="mt-2 flex-1 text-sm text-ink-soft">{workshop.description}</p>}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {workshop.date && <span>{workshop.date}</span>}
          {workshop.time && <span>{workshop.time}</span>}
          {workshop.location && <span>{workshop.location}</span>}
          {workshop.guest && <span>Convidado: {workshop.guest}</span>}
        </div>

        <span className="btn mt-5 w-full bg-gold text-center text-cream group-hover:bg-gold-dark">
          Ver detalhes
        </span>
      </div>
    </Link>
  );
}
