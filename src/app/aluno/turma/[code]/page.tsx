import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import JoinTurmaButton from "@/components/aluno/JoinTurmaButton";

export const metadata: Metadata = { title: "Convite de Turma" };
export const dynamic = "force-dynamic";

type Turma = {
  course_title: string;
  capacity: number;
  status: "a_preencher" | "fechada" | "paga";
  companies: { name: string } | { name: string }[] | null;
};

export default async function TurmaConvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: turma } = await supabase
    .from("turmas")
    .select("course_title, capacity, status, companies(name)")
    .eq("invite_code", code.toUpperCase())
    .maybeSingle();

  const student = await getCurrentStudent();
  const loginHref = `/aluno/login?from=${encodeURIComponent(`/aluno/turma/${code}`)}`;
  const registoHref = `/aluno/registo?from=${encodeURIComponent(`/aluno/turma/${code}`)}`;

  const companyName = turma
    ? Array.isArray((turma as Turma).companies)
      ? ((turma as Turma).companies as { name: string }[])[0]?.name
      : ((turma as Turma).companies as { name: string } | null)?.name
    : null;

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-md rounded border border-ink/10 bg-white/60 p-8 text-center">
          {!turma ? (
            <>
              <p className="eyebrow">Convite</p>
              <h1 className="mt-2 font-display text-2xl text-ink">Convite inválido</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Este link de convite não existe ou já não está disponível.
              </p>
            </>
          ) : turma.status !== "a_preencher" ? (
            <>
              <p className="eyebrow">Convite</p>
              <h1 className="mt-2 font-display text-2xl text-ink">Convite já não disponível</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Esta turma já fechou. Fale com {companyName ?? "a sua empresa"} para saber sobre uma próxima turma.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">Convite de {companyName ?? "empresa"}</p>
              <h1 className="mt-2 font-display text-2xl text-ink">{turma.course_title}</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Foi convidado para participar nesta formação através de {companyName ?? "a sua empresa"}. A sua
                inscrição não tem qualquer custo — é a empresa que paga a turma.
              </p>

              <div className="mt-6">
                {student ? (
                  <JoinTurmaButton code={code} />
                ) : (
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href={registoHref} className="btn-primary">
                      Criar conta
                    </Link>
                    <Link
                      href={loginHref}
                      className="rounded border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:border-ink/40"
                    >
                      Já tenho conta
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
