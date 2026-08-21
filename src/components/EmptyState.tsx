type Props = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded border border-dashed border-ink/20 bg-white/40 px-8 py-16 text-center">
      <p className="eyebrow">Em breve</p>
      <h3 className="mt-3 text-xl font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">{description}</p>
    </div>
  );
}
