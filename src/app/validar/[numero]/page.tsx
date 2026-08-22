import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Props = { params: { numero: string } };

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: Props): Metadata {
  return { title: `Validar certificado ${params.numero}` };
}

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  hours: string | null;
  issue_date: string;
  students: { name: string } | { name: string }[] | null;
};

async function getCertificate(numero: string) {
  // Consulta feita com a service role (servidor) — não depende de sessão,
  // por isso funciona para qualquer visitante que tenha o número do
  // certificado, sem expor a tabela inteira publicamente (RLS continua a
  // proteger o acesso directo via a chave pública).
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, hours, issue_date, students(name)")
    .eq("certificate_number", numero)
    .maybeSingle<CertificateRow>();

  return data;
}

export default async function ValidarCertificadoPage({ params }: Props) {
  const certificate = await getCertificate(params.numero);
  const studentName = Array.isArray(certificate?.students)
    ? certificate?.students[0]?.name
    : certificate?.students?.name;

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-lg rounded border border-ink/10 bg-white/60 p-10 text-center">
          <p className="eyebrow">Validação de Certificado</p>

          {certificate ? (
            <>
              <h1 className="mt-4 text-2xl font-medium text-ink">Certificado válido</h1>
              <p className="mt-6 text-sm text-ink-soft">Nº do certificado</p>
              <p className="text-lg font-medium text-ink">{certificate.certificate_number}</p>

              {studentName && (
                <>
                  <p className="mt-4 text-sm text-ink-soft">Emitido a</p>
                  <p className="text-lg font-medium text-ink">{studentName}</p>
                </>
              )}

              <p className="mt-4 text-sm text-ink-soft">Formação</p>
              <p className="text-lg font-medium text-ink">{certificate.course_title}</p>

              {certificate.hours && (
                <>
                  <p className="mt-4 text-sm text-ink-soft">Carga horária</p>
                  <p className="text-lg font-medium text-ink">{certificate.hours}</p>
                </>
              )}

              <p className="mt-4 text-sm text-ink-soft">Data de emissão</p>
              <p className="text-lg font-medium text-ink">
                {new Date(certificate.issue_date).toLocaleDateString("pt-PT")}
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-2xl font-medium text-ink">Certificado não encontrado</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Não existe nenhum certificado emitido pela Wealth Academy com o número{" "}
                <span className="font-medium text-ink">{params.numero}</span>.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
