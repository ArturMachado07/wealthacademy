import type { Workshop } from "@/data/workshops";

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return (
    <div className="flex flex-col rounded border border-ink/10 bg-white/60 p-6">
      <span className="eyebrow">{workshop.category}</span>
      <h3 className="mt-2 text-lg font-medium text-ink">{workshop.title}</h3>
      {workshop.description && <p className="mt-2 text-sm text-ink-soft">{workshop.description}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        {workshop.date && <span>{workshop.date}</span>}
        {workshop.location && <span>{workshop.location}</span>}
        {workshop.instructor && <span>{workshop.instructor}</span>}
      </div>
      <span className="mt-4 text-sm font-medium text-gold">{workshop.status}</span>
    </div>
  );
}
