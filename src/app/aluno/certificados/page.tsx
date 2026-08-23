import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = { title: "Os meus certificados" };
export const dynamic = "force-dynamic";

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  issue_date: string;
};

export default async function AlunoCertificadosPage() {
  const student = await getCurrentStudent();
  if (!student) {
    redirect("/aluno/login?from=/aluno/certificados");
  }

  const supabase = await createSupabaseServerClient();
  const { data: certificates } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, issue_date")
    .eq("student_id", student.id)
    .order("issue_date", { ascending: false });

  const certificateRows = (certificates ?? []) as CertificateRow[];

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/aluno" className="text-sm text-ink-soft underline">
          ← Voltar ao dashboard
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Área do Aluno</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Os meus certificados</h1>
        </div>

        <div className="mt-10">
          {certificateRows.length === 0 ? (
            <EmptyState
              eyebrow="Ainda sem certificados"
              title="Ainda não tem certificados emitidos"
              description="Assim que concluir uma formação e o Admin emitir o certificado, ele aparece aqui."
            />
          ) : (
            <div className="divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
              {certificateRows.map((certificate) => (
                <div
                  key={certificate.certificate_number}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-ink">{certificate.course_title}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Certificado {certificate.certificate_number} · Emitido em{" "}
                      {new Date(certificate.issue_date).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <Link
                    href={`/aluno/certificados/${certificate.certificate_number}`}
                    className="text-sm font-medium text-gold-dark underline"
                  >
                    Ver certificado
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
