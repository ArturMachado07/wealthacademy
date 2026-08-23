import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import CorporateForm from "@/components/CorporateForm";
import MediaSlot from "@/components/MediaSlot";

export const metadata: Metadata = {
  title: "Para Empresas",
  description:
    "Programas de formação personalizados da Wealth Academy para empresas e organizações em Angola.",
};

const steps = [
  { number: "01", title: "Diagnóstico", text: "Compreendemos os desafios e objectivos da sua organização." },
  { number: "02", title: "Desenho da solução", text: "Estruturamos um programa alinhado às necessidades identificadas." },
  { number: "03", title: "Implementação e avaliação", text: "Executamos a formação e avaliamos os resultados alcançados." },
];

export default function EmpresasPage() {
  return (
    <>
      <section className="bg-ink py-24 text-cream">
        <div className="container-page grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-gold-light">Para Empresas</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight md:text-5xl">
              Formação que responde aos desafios da sua organização.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80">
              A Wealth Academy desenvolve programas de formação personalizados para
              organizações que procuram desenvolver competências, fortalecer equipas e
              responder de forma estratégica às exigências do mercado.
            </p>
          </div>
          <MediaSlot
            baseName="para-empresas"
            alt="Formação corporativa Wealth Academy"
            className="aspect-[4/3] rounded"
          />
        </div>
      </section>

      <section className="py-24">
        <div className="container-page grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="font-display text-3xl text-gold">{step.number}</span>
              <h3 className="mt-3 text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/50 py-24">
        <div className="container-page max-w-2xl">
          <SectionHeading eyebrow="Solicitar" title="Solicitar Programa Personalizado" />
          <div className="mt-10">
            <CorporateForm />
          </div>
        </div>
      </section>
    </>
  );
}
