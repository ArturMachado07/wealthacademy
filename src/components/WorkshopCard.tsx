import type { Workshop } from "@/lib/workshops";

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const isPast = workshop.status === "Realizado";

  return (
    <div className="group flex flex-col overflow-hidden rounded border border-ink/10 bg-white/60 transition-colors hover:border-gold">
      <div className="aspect-[3/4] w-full overflow-hidden bg-ink/5">
        {workshop.flyer_url ? (
          // Vem do bucket público do Supabase Storage (domínio dinâmico por
          // ambiente) — <img> directo, tal como a foto de perfil do aluno,
          // em vez de next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={workshop.flyer_url}
            alt={workshop.title}
            className={`h-full w-full object-cover transition-transform group-hover:scale-[1.02] ${
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
          {workshop.location && <span>{workshop.location}</span>}
        </div>

        {!isPast &&
          (workshop.registration_link ? (
            <a
              href={workshop.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-5 w-full bg-gold text-center text-cream group-hover:bg-gold-dark"
            >
              Inscrever-me
            </a>
          ) : (
            <span className="mt-5 w-full rounded border border-ink/15 py-2.5 text-center text-sm text-ink-soft">
              Inscrições brevemente
            </span>
          ))}
      </div>
    </div>
  );
}
