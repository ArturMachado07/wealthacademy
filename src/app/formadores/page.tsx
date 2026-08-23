import type { Metadata } from "next";
import Link from "next/link";
import { getInstructors } from "@/lib/instructors";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import MediaSlot from "@/components/MediaSlot";
import Reveal from "@/components/Reveal";
import { staggerDelay } from "@/lib/reveal";

export const metadata: Metadata = {
  title: "Formadores",
  description: "Conheça os formadores que lecionam as formações da Wealth Academy.",
};

export const dynamic = "force-dynamic";

export default async function FormadoresPage() {
  const instructors = await getInstructors();

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Wealth Academy"
          title="Formadores"
          description="Profissionais experientes que partilham conhecimento prático nas formações da Wealth Academy."
        />

        <div className="mt-14">
          {instructors.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {instructors.map((instructor, i) => (
                <Reveal key={instructor.slug} delay={staggerDelay(i)}>
                  <Link
                    href={`/formadores/${instructor.slug}`}
                    className="group flex flex-col items-center rounded border border-ink/10 bg-white/60 p-8 text-center transition-colors hover:border-gold"
                  >
                    <MediaSlot
                      baseName={instructor.photo ?? instructor.slug}
                      alt={instructor.name}
                      className="h-28 w-28 shrink-0 rounded-full"
                    />
                    <p className="mt-5 font-medium text-ink">{instructor.name}</p>
                    {instructor.role && <p className="mt-1 text-sm text-ink-soft">{instructor.role}</p>}
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Ainda sem formadores"
              description="Os formadores da Wealth Academy vão aparecer aqui em breve."
            />
          )}
        </div>
      </div>
    </section>
  );
}
