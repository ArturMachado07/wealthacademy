type Props = {
  name: string;
  subtitle: string;
  embedUrl: string;
};

// Incorporação directa do YouTube — sem miniatura própria por cima; o
// YouTube mostra a sua própria pré-visualização até o visitante clicar em
// reproduzir, sem exigirmos um vídeo autoplay ao carregar a página.
export default function TestimonialVideoCard({ name, subtitle, embedUrl }: Props) {
  return (
    <div className="overflow-hidden rounded border border-ink/10 bg-white/60">
      <div className="relative aspect-video w-full bg-ink">
        <iframe
          src={embedUrl}
          title={`Testemunho de ${name}`}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <p className="font-medium text-ink">{name}</p>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}
