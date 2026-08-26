import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import MediaSlot from "@/components/MediaSlot";
import { getCurrentCompany } from "@/lib/company-auth";

export const metadata: Metadata = {
  title: "Para Empresas",
  description:
    "Programas de formação corporativa da Wealth Academy, em turmas de colaboradores — crie a conta da sua empresa.",
};

const steps = [
  { number: "01", title: "Diagnóstico", text: "Compreendemos os desafios e objectivos da sua organização." },
  { number: "02", title: "Desenho da solução", text: "Estruturamos um programa alinhado às necessidades identificadas." },
  { number: "03", title: "Implementação e avaliação", text: "Executamos a formação e avaliamos os resultados alcançados." },
];

const features = [
  { title: "Turmas de 6", text: "Convide colaboradores com um link próprio — a turma fecha ao 6º, com desconto." },
  { title: "Pagamento único", text: "A empresa paga a turma toda de uma vez; os colaboradores não pagam nada." },
  { title: "Acompanhamento", text: "Veja o progresso de cada colaborador e o estado de cada turma num só painel." },
];

export default async function EmpresasPage() {
  // Já autenticada — segue directo para o Portal da Empresa.
  const company = await getCurrentCompany();
  if (company) {
    redirect("/empresa");
  }

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
              A Wealth Academy desenvolve programas de formação corporativa para
              organizações que procuram desenvolver competências, fortalecer equipas e
              responder de forma estratégica às exigências do mercado — em turmas de
              colaboradores, com um portal próprio para a sua empresa.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/empresas/registo" className="btn-primary">
                Criar conta
              </Link>
              <Link
                href="/empresas/login"
                className="rounded border border-cream/30 px-6 py-3 text-sm font-medium text-cream hover:border-cream/60"
              >
                Entrar
              </Link>
            </div>
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
          <SectionHeading
            eyebrow="Portal da Empresa"
            title="Crie a conta da sua empresa e convide os colaboradores."
            description="Cada turma tem até 6 colaboradores. Ao fechar completa, tem 5% de desconto no valor total — a empresa paga a turma de uma só vez, os colaboradores não pagam nada."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded border border-ink/10 bg-white p-6">
                <h3 className="text-base font-medium text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/empresas/registo" className="btn-primary">
              Criar conta
            </Link>
            <Link
              href="/empresas/login"
              className="rounded border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:border-ink/40"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
