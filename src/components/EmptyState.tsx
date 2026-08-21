type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  note?: string;
};

export default function EmptyState({ eyebrow = "Em breve", title, description, note }: Props) {
  return (
    <div className="rounded border border-dashed border-ink/20 bg-white/40 px-8 py-16 text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">{description}</p>
      {note && <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft/70">{note}</p>}
    </div>
  );
}
