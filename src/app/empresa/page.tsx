import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";
import { parseInvestment, formatKz, turmaTotal } from "@/lib/pricing";
import SignOutButton from "@/components/SignOutButton";
import CompanyNotificationBell from "@/components/empresa/NotificationBell";
import CreateTurmaForm from "@/components/empresa/CreateTurmaForm";
import InviteLinkBox from "@/components/empresa/InviteLinkBox";
import CloseTurmaButton from "@/components/empresa/CloseTurmaButton";
import { UsersIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Portal da Empresa" };
export const dynamic = "force-dynamic";

type Turma = {
  id: string;
  course_slug: string;
  course_title: string;
  invite_code: string;
  capacity: number;
  status: "a_preencher" | "fechada" | "paga";
  discount_applied: boolean;
  created_at: string;
};

type Member = {
  id: string;
  status: string;
  progress_percent: number;
  students: { name: string } | { name: string }[] | null;
};

function memberName(member: Member) {
  const s = Array.isArray(member.students) ? member.students[0] : member.students;
  return s?.name ?? "Colaborador";
}

const STATUS_LABEL: Record<Turma["status"], string> = {
  a_preencher: "A preencher",
  fechada: "Fechada · por facturar",
  paga: "Em curso · Paga",
};

const STATUS_CLASS: Record<Turma["status"], string> = {
  a_preencher: "bg-gold/10 text-gold-dark",
  fechada: "bg-red-100 text-red-700",
  paga: "bg-green-100 text-green-800",
};

export default async function EmpresaDashboardPage() {
  const company = await getCurrentCompany();
  if (!company) {
    redirect("/empresas/login");
  }

  const supabase = createSupabaseAdminClient();
  const { data: turmasData } = await supabase
    .from("turmas")
    .select("id, course_slug, course_title, invite_code, capacity, status, discount_applied, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const turmas = (turmasData ?? []) as Turma[];

  const membersByTurma = new Map<string, Member[]>();
  for (const turma of turmas) {
    const { data: members } = await supabase
      .from("enrollments")
      .select("id, status, progress_percent, students(name)")
      .eq("turma_id", turma.id);
    membersByTurma.set(turma.id, (members ?? []) as Member[]);
  }

  const overrides = await getCourseOverrides();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";

  return (
    <section className="py-16">
      <div className="container-page">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Portal da Empresa</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Olá, {company.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CompanyNotificationBell />
            <SignOutButton />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium text-ink">As suas turmas</h2>

          {turmas.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Ainda não tem turmas — crie a primeira abaixo.</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {turmas.map((turma) => {
                const members = membersByTurma.get(turma.id) ?? [];
                const course = courses.find((c) => c.slug === turma.course_slug);
                const priced = course ? applyCourseOverride(course, overrides.get(course.slug)) : null;
                const unitPrice = parseInvestment(priced?.investment);
                const total = unitPrice ? turmaTotal(unitPrice, members.length, turma.discount_applied) : null;

                return (
                  <div key={turma.id} className="rounded border border-ink/10 bg-white/60 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
                          <UsersIcon className="h-[18px] w-[18px] text-gold-dark" />
                        </span>
                        <p className="font-medium text-ink">{turma.course_title}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[turma.status]}`}>
                        {members.length}/{turma.capacity} · {STATUS_LABEL[turma.status]}
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${Math.min(100, (members.length / turma.capacity) * 100)}%` }}
                      />
                    </div>

                    {total !== null && (
                      <p className="mt-3 text-sm text-ink-soft">
                        {turma.status === "a_preencher"
                          ? `Valor actual (${members.length} pessoa${members.length === 1 ? "" : "s"}, sem desconto): ${formatKz(total)}`
                          : `Valor da turma${turma.discount_applied ? " (com 5% de desconto)" : ""}: ${formatKz(total)}`}
                      </p>
                    )}

                    {turma.status === "a_preencher" && (
                      <>
                        <p className="mt-3 text-xs text-ink-soft">
                          {turma.capacity - members.length > 0
                            ? `Faltam ${turma.capacity - members.length} colaborador(es) para activar o desconto de 5%.`
                            : "Turma completa."}
                        </p>
                        <InviteLinkBox link={`${siteUrl}/aluno/turma/${turma.invite_code}`} />
                        {members.length > 0 && <CloseTurmaButton turmaId={turma.id} />}
                      </>
                    )}

                    {members.length > 0 && turma.status !== "a_preencher" && (
                      <table className="mt-4 w-full text-sm">
                        <thead>
                          <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-soft">
                            <th className="py-2 pr-4">Colaborador</th>
                            <th className="py-2 pr-4">Progresso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr key={member.id} className="border-b border-ink/5 last:border-b-0">
                              <td className="py-2 pr-4 text-ink">{memberName(member)}</td>
                              <td className="py-2 pr-4 text-ink-soft">{member.progress_percent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10">
          <CreateTurmaForm courses={courses.map((c) => ({ slug: c.slug, title: c.title }))} />
        </div>
      </div>
    </section>
  );
}
