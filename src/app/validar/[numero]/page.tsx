import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import CertificateView from "@/components/CertificateView";
import DownloadCertificateButton from "@/components/DownloadCertificateButton";

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
  const validateUrl = `${siteUrl.replace(/^https?:\/\//, "")}/validar/${params.numero}`;

  return (
    <section className="py-24 print:py-0">
      <div className="container-page print:max-w-none print:px-0">
        {certificate && studentName ? (
          <>
            <div className="mx-auto max-w-3xl text-center print:hidden">
              <p className="eyebrow">Validação de Certificado</p>
              <h1 className="mt-3 font-display text-2xl text-ink">Certificado válido</h1>
              <div className="mt-6 flex justify-center">
                <DownloadCertificateButton />
              </div>
            </div>
            <div className="mt-8 print:mt-0">
              <CertificateView
                studentName={studentName}
                courseTitle={certificate.course_title}
                hours={certificate.hours}
                issueDate={certificate.issue_date}
                certificateNumber={certificate.certificate_number}
                validateUrl={validateUrl}
              />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-lg rounded border border-ink/10 bg-white/60 p-10 text-center">
            <p className="eyebrow">Validação de Certificado</p>
            <h1 className="mt-4 text-2xl font-medium text-ink">Certificado não encontrado</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Não existe nenhum certificado emitido pela Wealth Academy com o número{" "}
              <span className="font-medium text-ink">{params.numero}</span>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
