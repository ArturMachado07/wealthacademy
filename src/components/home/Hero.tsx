import Link from "next/link";
import MediaSlot from "@/components/MediaSlot";
import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-ink">
      <MediaSlot
        baseName="banner-hero"
        alt="Formação Wealth Academy"
        className="absolute inset-0"
        priority
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#9D743A] via-[#9D743A]/70 to-[#F8EA9A]/40"
        aria-hidden="true"
      />
      <div className="container-page relative flex min-h-[82vh] flex-col justify-center py-28">
        <Reveal as="p" className="eyebrow text-ink">
          Wealth Academy
        </Reveal>
        <Reveal
          as="h1"
          delay={80}
          className="mt-5 max-w-3xl text-4xl font-medium leading-[1.1] text-ink md:text-6xl"
        >
          Conhecimento que transforma. Competências que distinguem.
        </Reveal>
        <Reveal as="p" delay={160} className="mt-6 max-w-xl text-lg text-ink/85">
          Formação especializada em Finanças e Negócios para profissionais e organizações
          preparados para evoluir.
        </Reveal>
        <Reveal as="div" delay={240} className="mt-10 flex flex-wrap gap-4">
          <Link href="/formacoes" className="btn-primary">
            Explorar Formações
          </Link>
          <Link href="/empresas" className="btn-secondary">
            Soluções para Empresas
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
