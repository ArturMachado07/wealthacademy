import type { WealthEvent } from "@/data/events";

const statusStyles: Record<string, string> = {
  "Próximo": "bg-ink/10 text-ink",
  "Inscrições abertas": "bg-gold/15 text-gold-dark",
  "Esgotado": "bg-ink/10 text-ink-soft",
  "Realizado": "bg-ink/5 text-ink-soft",
};

export default function EventCard({ event }: { event: WealthEvent }) {
  return (
    <div className="flex flex-col rounded border border-ink/10 bg-white/60 p-6">
      <span className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-medium ${statusStyles[event.status]}`}>
        {event.status}
      </span>
      <h3 className="mt-3 text-lg font-medium text-ink">{event.title}</h3>
      {event.description && <p className="mt-2 text-sm text-ink-soft">{event.description}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span>{event.date}</span>
        {event.time && <span>{event.time}</span>}
        {event.location && <span>{event.location}</span>}
      </div>
    </div>
  );
}
