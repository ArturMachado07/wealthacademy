import type { Metadata } from "next";
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
  { title: "Certificados", text: "Certificados digitais, com número único e validação por QR code." },
  { title: "Perfil", text: "Os seus dados e histórico de formação num só lugar." },
];

export default async function AreaDoAlunoPage() {
  // Preparado para a fase em que a autenticação real existir: quando
  // getCurrentStudent() devolver um aluno, este ecrã passa a redireccionar
  // para o dashboard funcional em vez de mostrar a apresentação abaixo.
  const student = await getCurrentStudent();
  void student;

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Área do Aluno"
          title="A sua evolução, organizada num só lugar."
          description="Esta área está em preparação. Quando estiver disponível, cada aluno terá acesso a um espaço pessoal com os elementos abaixo."
        />

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
