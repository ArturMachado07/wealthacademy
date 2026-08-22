import SectionHeading from "@/components/SectionHeading";
import { testimonials } from "@/data/testimonials";
import { findPublicImage } from "@/lib/media";

// Sempre 3 lugares — os testemunhos ainda por gravar ficam como placeholder
// discreto em vez de inventar conteúdo.
const CARD_COUNT = 3;

export default function TestimonialsSection() {
  const slots = Array.from({ length: CARD_COUNT }, (_, i) => testimonials[i] ?? null);

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testemunhos"
          title="Quem já passou pela Wealth Academy"
          description="Formandos que participaram nos nossos cursos partilham a sua experiência."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {slots.map((testimonial, i) =>
            testimonial ? (
              <div
                key={testimonial.name}
                className="overflow-hidden rounded border border-ink/10 bg-white/60"
              >
                <div className="aspect-video w-full bg-ink">
                  <video
                    src={`/${testimonial.video}`}
                    poster={testimonial.photo ? (findPublicImage(testimonial.photo) ?? undefined) : undefined}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="font-medium text-ink">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{testimonial.subtitle}</p>
                </div>
              </div>
            ) : (
              <div
                key={`em-breve-${i}`}
                className="flex flex-col overflow-hidden rounded border border-dashed border-ink/15 bg-white/30"
              >
                <div className="flex aspect-video w-full items-center justify-center bg-ink/5">
                  <span className="text-xs uppercase tracking-wide text-ink-soft">Brevemente</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-ink-soft">Testemunho em preparação.</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
