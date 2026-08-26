import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = { title: "Certificados dos colaboradores" };
export const dynamic = "force-dynamic";

type EnrollmentRow = {
  id: string;
  student_id: string;
  course_title: string;
  students: { name: string } | { name: string }[] | null;
};

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  issue_date: string;
  file_path: string | null;
  enrollment_id: string | null;
};

function studentNameOf(row: EnrollmentRow) {
  const s = Array.isArray(row.students) ? row.students[0] : row.students;
  return s?.name ?? "Colaborador";
}

export default async function EmpresaCertificadosPage() {
  const company = await getCurrentCompany();
  if (!company) {
    redirect("/empresas/login?from=/empresa/certificados");
  }

  const supabase = createSupabaseAdminClient();

  const { data: turmasData } = await supabase.from("turmas").select("id").eq("company_id", company.id);
  const turmaIds = (turmasData ?? []).map((t) => t.id as string);

  let rows: { certificate: CertificateRow; studentName: string }[] = [];

  if (turmaIds.length > 0) {
    const { data: enrollmentsData } = await supabase
      .from("enrollments")
      .select("id, student_id, course_title, students(name)")
      .in("turma_id", turmaIds);

    const enrollments = (enrollmentsData ?? []) as EnrollmentRow[];
    const enrollmentIds = enrollments.map((e) => e.id);

    if (enrollmentIds.length > 0) {
      const { data: certificatesData } = await supabase
        .from("certificates")
        .select("certificate_number, course_title, issue_date, file_path, enrollment_id")
        .in("enrollment_id", enrollmentIds)
        .order("issue_date", { ascending: false });

      const certificates = (certificatesData ?? []) as CertificateRow[];
      const nameByEnrollment = new Map(enrollments.map((e) => [e.id, studentNameOf(e)]));

      rows = certificates.map((certificate) => ({
        certificate,
        studentName: nameByEnrollment.get(certificate.enrollment_id ?? "") ?? "Colaborador",
      }));
    }
  }

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/empresa" className="text-sm text-ink-soft underline">
          ← Voltar ao Portal da Empresa
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Portal da Empresa</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Certificados dos colaboradores</h1>
        </div>

        <div className="mt-10">
          {rows.length === 0 ? (
            <EmptyState
              eyebrow="Ainda sem certificados"
              title="Ainda não há certificados emitidos"
              description="Assim que um colaborador concluir uma formação e o Admin emitir o certificado, ele aparece aqui."
            />
          ) : (
            <div className="divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
              {rows.map(({ certificate, studentName }) => (
                <div
                  key={certificate.certificate_number}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-ink">{certificate.course_title}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {studentName} · Certificado {certificate.certificate_number} · Emitido em{" "}
                      {new Date(certificate.issue_date).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  {certificate.file_path ? (
                    <a
                      href={`/api/empresas/certificados/${certificate.certificate_number}/ficheiro`}
                      className="text-sm font-medium text-gold-dark underline"
                    >
                      Ver certificado
                    </a>
                  ) : (
                    <span className="text-xs text-ink-soft">A aguardar emissão</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
