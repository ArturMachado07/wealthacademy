import Image from "next/image";
import Reveal from "@/components/Reveal";

export default function PartnerLogos() {
  return (
    <section className="border-y border-ink/10 bg-cream py-16">
      <div className="container-page">
        <Reveal as="p" className="eyebrow text-center">
          Credibilidade Institucional
        </Reveal>
        <Reveal as="div" delay={100} className="mt-8 flex justify-center">
          <Image
            src="/brand/Logos_credibilidade-institucional.webp"
            alt="Logótipos INEFOP, INAPEM e Feito em Angola"
            width={900}
            height={200}
            loading="lazy"
            className="h-auto w-full max-w-sm object-contain"
          />
        </Reveal>
      </div>
    </section>
  );
}
