import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import PartnerLogos from "@/components/PartnerLogos";
import ExperienceLogos from "@/components/ExperienceLogos";
import MediaSlot from "@/components/MediaSlot";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Wealth Academy — Academia de Formação em Finanças e Negócios licenciada pelo INEFOP. Missão, visão, valores e credibilidade institucional.",
};

const values = [
  {
    title: "Qualidade",
    text: "Compromisso com conteúdos de elevado nível, ministrados por especialistas e profissionais com experiência relevante.",
  },
  {
    title: "Inclusão",
    text: "Democratização do conhecimento, tornando a formação acessível e relevante para diferentes perfis de participantes.",
  },
  {
    title: "Inovação Educacional",
    text: "Utilização de metodologias dinâmicas e actualizadas para proporcionar experiências de aprendizagem eficazes.",
  },
  {
    title: "Ética e Profissionalismo",
    text: "Promoção de práticas responsáveis, éticas e alinhadas com as exigências do mercado financeiro e empresarial.",
  },
  {
    title: "Sustentabilidade",
    text: "Incentivo a práticas e conhecimentos que contribuam para um desenvolvimento responsável e sustentável.",
  },
];

const offerings = [
  { title: "Cursos", text: "Programas de formação concebidos para desenvolver conhecimentos e competências relevantes nas áreas de Finanças, Negócios e desenvolvimento profissional." },
  { title: "Workshops", text: "Sessões de aprendizagem focadas em temas específicos, permitindo aprofundar conhecimentos e explorar ferramentas e metodologias aplicáveis à realidade profissional." },
  { title: "Programas Personalizados", text: "Soluções formativas desenvolvidas de acordo com as necessidades específicas de empresas, instituições e equipas." },
];

export default function SobrePage() {
  return (
    <>
      <section className="bg-ink py-24 text-cream">
        <div className="container-page grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-gold-light">Sobre Nós</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight md:text-5xl">
              Sua distinção, Nossa missão.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80">
              A Wealth Academy é uma Academia de Formação em Finanças e Negócios, dedicada à
              capacitação de profissionais, empreendedores, organizações e instituições através
              de soluções formativas orientadas para o desenvolvimento de competências e para as
              exigências do mercado.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/80">
              Licenciada pelo Instituto Nacional de Emprego e Formação Profissional (INEFOP), com
              o registo 1140.01/LDA./2024, a Wealth Academy tem como propósito contribuir para a
              formação de profissionais de excelência e para o desenvolvimento de uma sociedade
              mais informada, estratégica e preparada para os desafios financeiros e empresariais.
            </p>
          </div>
          <MediaSlot
            baseName="sobre"
            alt="Comunidade e formandos da Wealth Academy"
            className="aspect-[4/3] rounded"
          />
        </div>
      </section>

      <section className="py-24">
        <div className="container-page grid gap-14 md:grid-cols-2">
          <div>
            <p className="eyebrow">Missão</p>
            <p className="mt-3 text-xl leading-relaxed text-ink">
              Capacitar e fornecer ferramentas que transformem o panorama financeiro e
              empresarial, contribuindo para a evolução e competitividade dos nossos parceiros.
            </p>
          </div>
          <div>
            <p className="eyebrow">Visão</p>
            <p className="mt-3 text-xl leading-relaxed text-ink">
              Consolidar-nos como a principal plataforma de educação financeira em Angola,
              formando profissionais de excelência e fomentando uma sociedade financeiramente
              informada, estratégica e resiliente.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/50 py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Valores" title="O que orienta o nosso trabalho" />
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title}>
                <h3 className="text-lg font-medium text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-page">
          <SectionHeading eyebrow="O que fazemos" title="Cursos, Workshops e Programas Personalizados" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {offerings.map((item) => (
              <div key={item.title} className="rounded border border-ink/10 bg-white/60 p-8">
                <h3 className="text-lg font-medium text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-3xl text-ink-soft">
            A Wealth Academy trabalha com diferentes perfis e contextos, procurando responder
            aos desafios de desenvolvimento de competências de profissionais, empresas e
            instituições. A sua actividade formativa abrange, entre outras, áreas como
            Comercial, Comunicação, Desenvolvimento Profissional, Finanças, Liderança e
            Tecnologia.
          </p>
        </div>
      </section>

      <PartnerLogos />
      <ExperienceLogos />
    </>
  );
}
