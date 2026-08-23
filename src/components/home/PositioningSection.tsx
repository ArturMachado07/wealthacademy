import Reveal from "@/components/Reveal";

export default function PositioningSection() {
  return (
    <section className="py-24">
      <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal as="div">
          <p className="eyebrow">Posicionamento</p>
          <h2 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">
            Sua distinção, Nossa missão.
          </h2>
        </Reveal>
        <Reveal as="p" delay={120} className="text-base leading-relaxed text-ink-soft md:text-lg">
          A Wealth Academy desenvolve soluções de formação orientadas para as necessidades
          reais do mercado, combinando conhecimento, aplicação prática e desenvolvimento de
          competências. Academia especializada em Finanças e Negócios, licenciada pelo INEFOP.
        </Reveal>
      </div>
    </section>
  );
}
