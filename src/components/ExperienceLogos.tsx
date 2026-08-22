import Image from "next/image";
import { clientLogos } from "@/data/clients";

export default function ExperienceLogos() {
  return (
    <section className="bg-cream py-20">
      <div className="container-page">
        <p className="mx-auto max-w-2xl text-center text-lg font-medium text-ink md:text-xl">
          Experiência com instituições e profissionais de organizações como:
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3">
          {clientLogos.map((client) => (
            <div key={client.name} className="relative mx-auto h-9 w-full max-w-[120px] md:h-11">
              <Image
                src={`/brand/logos-insticuicoes/${client.file}`}
                alt={client.name}
                fill
                sizes="120px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
