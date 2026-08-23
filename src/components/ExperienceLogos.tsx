import Image from "next/image";
import { clientLogos } from "@/data/clients";
import Reveal, { staggerDelay } from "@/components/Reveal";

export default function ExperienceLogos() {
  return (
    <section className="bg-cream py-20">
      <div className="container-page">
        <Reveal as="p" className="mx-auto max-w-2xl text-center text-lg font-medium text-ink md:text-xl">
          Experiência com instituições e profissionais de organizações como:
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3">
          {clientLogos.map((client, i) => (
            <Reveal
              key={client.name}
              as="div"
              delay={staggerDelay(i, 60, 360)}
              className="relative mx-auto h-9 w-full max-w-[120px] md:h-11"
            >
              <Image
                src={`/brand/logos-insticuicoes/${client.file}`}
                alt={client.name}
                fill
                sizes="120px"
                loading="lazy"
                className="object-contain"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
