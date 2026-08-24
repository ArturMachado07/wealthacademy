import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getWorkshopBySlug } from "@/lib/workshops";
import WorkshopJsonLd from "@/components/WorkshopJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) return { title: "Workshop" };

  const description =
    workshop.description ?? `${workshop.title} — workshop da Wealth Academy.`;

  return {
    title: workshop.title,
    description,
    // É esta imagem que aparece como banner quando o link desta página
    // (não o link do WhatsApp em si) é partilhado — no WhatsApp, Facebook,
    // etc. Um link wa.me nunca carrega uma imagem própria.
    openGraph: workshop.flyer_url
      ? { title: workshop.title, description, images: [{ url: workshop.flyer_url }] }
      : { title: workshop.title, description },
    twitter: workshop.flyer_url
      ? { card: "summary_large_image", title: workshop.title, description, images: [workshop.flyer_url] }
      : undefined,
  };
}

export default async function WorkshopPage({ params }: Props) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) notFound();

  const isPast = workshop.status === "Realizado";

  return (
    <section className="py-24">
      <WorkshopJsonLd workshop={workshop} />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", path: "/" },
          { name: "Workshops e Webinars", path: "/workshops" },
          { name: workshop.title, path: `/workshops/${workshop.slug}` },
        ]}
      />
      <div className="container-page">
        <Link href="/workshops" className="text-sm text-ink-soft underline">
          ← Workshops
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded border border-ink/10 bg-ink/5">
            {workshop.flyer_url ? (
              // Vem do bucket público do Supabase Storage — remotePatterns
              // já configurado em next.config.mjs.
              <Image
                src={workshop.flyer_url}
                alt={workshop.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`object-cover ${isPast ? "grayscale" : ""}`}
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-10 text-center">
                <p className="text-sm text-ink-soft">Flyer em breve.</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {workshop.category && (
                <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">
                  {workshop.category}
                </span>
              )}
              <span className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink-soft">
                {workshop.status}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-medium leading-tight text-ink md:text-4xl">{workshop.title}</h1>

            {workshop.description && (
              <p className="mt-4 text-base leading-relaxed text-ink-soft">{workshop.description}</p>
            )}

            <div className="mt-6 space-y-2 text-sm text-ink">
              {workshop.date && (
                <p>
                  <span className="text-ink-soft">Data:</span> {workshop.date}
                </p>
              )}
              {workshop.time && (
                <p>
                  <span className="text-ink-soft">Hora:</span> {workshop.time}
                </p>
              )}
              {workshop.location && (
                <p>
                  <span className="text-ink-soft">Local:</span> {workshop.location}
                </p>
              )}
              {workshop.guest && (
                <p>
                  <span className="text-ink-soft">Convidado:</span> {workshop.guest}
                </p>
              )}
            </div>

            {!isPast &&
              (workshop.registration_link ? (
                <a
                  href={workshop.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn mt-8 inline-block bg-gold text-cream hover:bg-gold-dark"
                >
                  Falar no WhatsApp
                </a>
              ) : (
                <p className="mt-8 text-sm text-ink-soft">Inscrições brevemente.</p>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
