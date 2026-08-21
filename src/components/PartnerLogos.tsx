import Image from "next/image";
import { partners } from "@/data/partners";

export default function PartnerLogos() {
  return (
    <section className="border-y border-ink/10 bg-cream py-16">
      <div className="container-page">
        <p className="eyebrow text-center">Credibilidade Institucional</p>
        <h2 className="mx-auto mt-3 max-w-xl text-center text-2xl font-medium text-ink md:text-3xl">
          INEFOP · INAPEM · Feito em Angola
        </h2>
        <div className="mt-10 flex justify-center">
          <Image
            src="/brand/Logos_credibilidade-institucional.webp"
            alt="Logótipos INEFOP, INAPEM e Feito em Angola"
            width={900}
            height={200}
            className="h-auto w-full max-w-2xl object-contain"
          />
        </div>
        <ul className="mx-auto mt-8 grid max-w-3xl gap-4 text-sm text-ink-soft md:grid-cols-3">
          {partners.map((p) => (
            <li key={p.name}>
              <span className="block font-semibold text-ink">{p.name}</span>
              {p.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
