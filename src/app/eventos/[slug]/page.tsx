import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { events } from "@/data/events";
import MediaSlot from "@/components/MediaSlot";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) return { title: "Evento" };
  return { title: event.title, description: event.description };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  return (
    <article className="py-24">
      <div className="container-page max-w-3xl">
        <Link href="/eventos" className="text-sm text-ink-soft underline">
          ← Eventos
        </Link>

        <p className="eyebrow mt-6">{event.type ?? "Evento"}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">{event.title}</h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          {event.date && <span>{event.date}</span>}
          {event.location && (
            <>
              <span>·</span>
              <span>{event.location}</span>
            </>
          )}
        </div>

        {event.photo && (
          <MediaSlot baseName={event.photo} alt={event.title} className="mt-8 aspect-[16/9] rounded" />
        )}

        {event.body && event.body.length > 0 && (
          <div className="prose-content mt-10 space-y-5 text-base leading-relaxed text-ink-soft">
            {event.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {event.details && event.details.length > 0 && (
          <dl className="mt-10 grid grid-cols-1 gap-6 border-y border-ink/10 py-8 sm:grid-cols-2">
            {event.details.map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-wide2 text-ink-soft">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {event.source && (
          <p className="mt-10 border-t border-ink/10 pt-6 text-sm text-ink-soft">
            Publicado originalmente em {event.source}
            {event.sourceUrl && (
              <>
                {" — "}
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gold-dark"
                >
                  ler no site de origem
                </a>
              </>
            )}
            .
          </p>
        )}
      </div>
    </article>
  );
}
