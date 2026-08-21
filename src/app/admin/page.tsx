import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { courses } from "@/data/courses";
import { workshops } from "@/data/workshops";
import { events } from "@/data/events";
import { articles } from "@/data/articles";
import { instructors } from "@/data/instructors";
import { enrollments } from "@/data/enrollments";
import { certificates } from "@/data/certificates";
import { payments } from "@/data/payments";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const modules = [
  { title: "Cursos", count: courses.length, description: "Catálogo de formações, categorias e páginas individuais." },
  { title: "Formadores", count: instructors.length, description: "Perfis dos formadores associados às formações." },
  { title: "Alunos", count: enrollments.length, description: "Base de alunos e histórico de formação." },
  { title: "Inscrições", count: enrollments.length, description: "Estado de cada inscrição e progresso associado." },
  { title: "Pagamentos", count: payments.length, description: "Registo de pagamentos por inscrição." },
  { title: "Certificados", count: certificates.length, description: "Emissão e validação de certificados digitais." },
  { title: "Leads", count: 0, description: "Pedidos recebidos via formulários (contacto, empresas, lista de interesse)." },
  { title: "Eventos", count: events.length, description: "Calendário de eventos e respectivos estados." },
  { title: "Workshops", count: workshops.length, description: "Workshops, filtros por área e vagas." },
  { title: "Artigos", count: articles.length, description: "Conteúdo editorial da secção Wealth Insights." },
  { title: "Configurações", count: 1, description: "Dados institucionais, contactos e redes sociais." },
];

export default async function AdminPage() {
  // Preparado para quando existir autenticação administrativa real: com
  // getCurrentAdmin() a devolver um utilizador, este ecrã passa a
  // redireccionar para o painel funcional em vez desta apresentação.
  const admin = await getCurrentAdmin();
  void admin;

  return (
    <section className="py-24">
      <div className="container-page max-w-4xl">
        <p className="eyebrow">Admin / CRM</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">
          Painel de gestão — em preparação
        </h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Esta área ainda não tem autenticação nem funcionalidade administrativa — apenas a
          estrutura de dados que os módulos abaixo vão usar. Os números reflectem o estado
          actual (zero, porque ainda não há dados reais).
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {modules.map((m) => (
            <div key={m.title} className="flex items-center justify-between rounded border border-ink/10 bg-white/60 p-5">
              <div>
                <h3 className="font-medium text-ink">{m.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{m.description}</p>
              </div>
              <span className="ml-4 shrink-0 rounded-full bg-ink/5 px-3 py-1 text-sm font-medium text-ink-soft">
                {m.count}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink-soft">
          Antes de construir a funcionalidade real, este painel precisa de autenticação
          administrativa própria (mais forte do que o gate de staging) e de decisão sobre
          onde os dados vão viver (CMS, base de dados ou ambos).
        </p>
      </div>
    </section>
  );
}
