import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #C79A5D 0, transparent 45%), radial-gradient(circle at 80% 60%, #C79A5D 0, transparent 40%)",
        }}
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
