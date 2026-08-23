import SectionHeading from "@/components/SectionHeading";
import { testimonials } from "@/data/testimonials";
import TestimonialVideoCard from "@/components/home/TestimonialVideoCard";
import Reveal, { staggerDelay } from "@/components/Reveal";

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
          description="Formandos e Formadores que participaram nos nossos cursos partilham a sua experiência."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {slots.map((testimonial, i) =>
            testimonial ? (
              <Reveal key={testimonial.name} as="div" delay={staggerDelay(i)}>
                <TestimonialVideoCard
                  name={testimonial.name}
                  subtitle={testimonial.subtitle}
                  embedUrl={testimonial.embedUrl}
                />
              </Reveal>
            ) : (
              <Reveal
                key={`em-breve-${i}`}
                as="div"
                delay={staggerDelay(i)}
                className="flex flex-col overflow-hidden rounded border border-dashed border-ink/15 bg-white/30"
              >
                <div className="flex aspect-video w-full items-center justify-center bg-ink/5">
                  <span className="text-xs uppercase tracking-wide text-ink-soft">Brevemente</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-ink-soft">Testemunho em preparação.</p>
                </div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
