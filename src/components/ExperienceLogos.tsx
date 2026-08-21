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
            <div key={client.name} className="flex items-center justify-center">
              <Image
                src={`/brand/logos-insticuicoes/${client.file}`}
                alt={client.name}
                width={220}
                height={80}
                className="h-10 w-auto max-w-[160px] object-contain md:h-12 md:max-w-[180px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
