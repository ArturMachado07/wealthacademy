import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import InterestForm from "@/components/InterestForm";
import { getCurrentStudent } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Área do Aluno",
  description: "Área do Aluno da Wealth Academy — em preparação.",
};

const features = [
  { title: "Meus Cursos", text: "Formações em que está inscrito, com acesso directo aos conteúdos." },
  { title: "Progresso", text: "Acompanhamento do avanço em cada formação, módulo a módulo." },
  { title: "Próxima Aula", text: "O que se segue no seu percurso, sempre à mão." },
  { title: "Avaliações", text: "Testes e exercícios associados às formações concluídas." },
  { title: "Certificados", text: "Certificados digitais, com número único e validação pública online." },
  { title: "Perfil", text: "Os seus dados e histórico de formação num só lugar." },
];

export default async function AreaDoAlunoPage() {
  // Já autenticado — segue directo para o dashboard funcional em vez de
  // mostrar a apresentação abaixo.
  const student = await getCurrentStudent();
  if (student) {
    redirect("/aluno");
  }

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Área do Aluno"
          title="A sua evolução, organizada num só lugar."
          description="Cada aluno tem acesso a um espaço pessoal com os elementos abaixo. Algumas funcionalidades ainda estão em preparação."
        />

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/aluno/login" className="btn-primary">
            Entrar
          </Link>
          <Link
            href="/aluno/registo"
            className="rounded border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:border-ink/40"
          >
            Criar conta
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded border border-dashed border-ink/20 bg-white/40 p-6">
              <h3 className="text-lg font-medium text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-xl rounded border border-ink/10 bg-white/60 p-8">
          <p className="eyebrow">Seja notificado</p>
          <h3 className="mt-2 text-xl font-medium text-ink">Quer saber quando a Área do Aluno abrir?</h3>
          <div className="mt-6">
            <InterestForm />
          </div>
        </div>
      </div>
    </section>
  );
}
