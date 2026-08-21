import Link from "next/link";
import MediaSlot from "@/components/MediaSlot";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <MediaSlot
        baseName="hero"
        alt="Formação Wealth Academy"
        className="absolute inset-0"
        priority
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/50"
        aria-hidden="true"
      />
      <div className="container-page relative flex min-h-[82vh] flex-col justify-center py-28">
        <p className="eyebrow text-gold-light">Wealth Academy</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.1] md:text-6xl">
          Conhecimento que transforma. Competências que distinguem.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-cream/80">
          Formação especializada em Finanças e Negócios para profissionais e organizações
          preparados para evoluir.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/formacoes" className="btn-primary">
            Explorar Formações
          </Link>
          <Link href="/empresas" className="btn-ghost">
            Soluções para Empresas
          </Link>
        </div>
      </div>
    </section>
  );
}
