import Link from "next/link";
import type { WealthEvent } from "@/data/events";
import MediaSlot from "@/components/MediaSlot";
import { ArrowRightIcon } from "@/components/icons";

const statusStyles: Record<string, string> = {
  "Próximo": "bg-ink/10 text-ink",
  "Inscrições abertas": "bg-gold/15 text-gold-dark",
  "Esgotado": "bg-ink/10 text-ink-soft",
  "Realizado": "bg-ink/5 text-ink-soft",
};

export default function EventCard({ event }: { event: WealthEvent }) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded border border-ink/10 bg-white/60 transition-colors hover:border-gold"
    >
      {event.photo && (
        <MediaSlot baseName={event.photo} alt={event.title} className="aspect-[16/9]" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-medium ${statusStyles[event.status]}`}>
            {event.status}
          </span>
          {event.type && <span className="text-xs text-ink-soft">{event.type}</span>}
        </div>
        <h3 className="mt-3 text-lg font-medium text-ink group-hover:text-gold-dark">{event.title}</h3>
        {event.description && <p className="mt-2 flex-1 text-sm text-ink-soft">{event.description}</p>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {event.date && <span>{event.date}</span>}
          {event.time && <span>{event.time}</span>}
          {event.location && <span>{event.location}</span>}
        </div>
        <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold group-hover:underline">
          Ler mais
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
