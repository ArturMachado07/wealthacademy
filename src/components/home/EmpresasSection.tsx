import Link from "next/link";
import Reveal from "@/components/Reveal";
import { staggerDelay } from "@/lib/reveal";

const steps = [
  { number: "01", title: "Diagnóstico" },
  { number: "02", title: "Desenho da solução" },
  { number: "03", title: "Implementação e avaliação" },
];

export default function EmpresasSection() {
  return (
    <section className="bg-ink py-24 text-cream">
      <div className="container-page grid gap-14 md:grid-cols-2 md:items-start">
        <Reveal as="div">
          <p className="eyebrow text-gold-light">Para Empresas</p>
          <h2 className="mt-3 text-3xl font-medium leading-tight md:text-4xl">
            Formação que responde aos desafios da sua organização.
          </h2>
          <p className="mt-5 max-w-md text-cream/75">
            A Wealth Academy desenvolve programas de formação personalizados para
            organizações que procuram desenvolver competências, fortalecer equipas e
            responder de forma estratégica às exigências do mercado.
          </p>
          <Link href="/empresas" className="btn-primary mt-8 inline-flex">
            Para Empresas
          </Link>
        </Reveal>

        <ol className="space-y-8">
          {steps.map((step, i) => (
            <Reveal
              key={step.number}
              as="li"
              delay={staggerDelay(i)}
              className="flex gap-5 border-b border-cream/10 pb-8 last:border-0"
            >
              <span className="font-display text-2xl text-gold-light">{step.number}</span>
              <span className="pt-1 text-lg">{step.title}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
