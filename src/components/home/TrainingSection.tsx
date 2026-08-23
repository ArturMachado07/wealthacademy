import Link from "next/link";
import { trainingCategories } from "@/data/categories";
import Reveal, { staggerDelay } from "@/components/Reveal";

const offerings = [
  {
    title: "Cursos",
    description: "Programas de formação estruturados para desenvolver conhecimento aprofundado.",
  },
  {
    title: "Workshops",
    description: "Sessões práticas e concentradas sobre temas específicos.",
  },
  {
    title: "Programas Personalizados",
    description: "Soluções formativas desenhadas para as necessidades da sua organização.",
  },
];

export default function TrainingSection() {
  return (
    <section className="bg-white/50 py-24">
      <div className="container-page">
        <Reveal as="div" className="max-w-2xl">
          <p className="eyebrow">Formação</p>
          <h2 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">
            Aprenda. Desenvolva. Distinga-se.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {offerings.map((item, i) => (
            <Reveal
              key={item.title}
              as="div"
              delay={staggerDelay(i)}
              className="rounded border border-ink/10 bg-cream p-8"
            >
              <h3 className="text-xl font-medium text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal as="div" className="mt-14 flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-soft">Áreas de formação:</span>
          {trainingCategories.map((category) => (
            <Link
              key={category}
              href={`/formacoes?categoria=${encodeURIComponent(category)}`}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink transition-colors hover:border-gold"
            >
              {category}
            </Link>
          ))}
        </Reveal>

        <div className="mt-10">
          <Link href="/formacoes" className="btn-secondary">
            Explorar Formações
          </Link>
        </div>
      </div>
    </section>
  );
}
