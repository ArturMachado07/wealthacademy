import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import CertificateFilePreview from "@/components/CertificateFilePreview";
import DownloadCertificateButton from "@/components/DownloadCertificateButton";
import ShareLinkedInButton from "@/components/ShareLinkedInButton";

type Props = { params: { numero: string } };

export const dynamic = "force-dynamic";

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  hours: string | null;
  issue_date: string;
  file_path: string | null;
  preview_path: string | null;
  students: { name: string } | { name: string }[] | null;
};

async function getCertificate(numero: string) {
  // Consulta feita com a service role (servidor) — não depende de sessão,
  // por isso funciona para qualquer visitante que tenha o número do
  // certificado (ex.: quem recebe a partilha no LinkedIn), sem expor a
  // tabela inteira publicamente (RLS continua a proteger o acesso directo
  // via a chave pública).
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, hours, issue_date, file_path, preview_path, students(name)")
    .eq("certificate_number", numero)
    .maybeSingle<CertificateRow>();

  return data;
}

// Link temporário assinado (para o storage privado "certificados") — gerado
// no servidor a cada carregamento da página, nunca guardado. 5 minutos
// chegam para a página carregar mesmo em ligações lentas.
async function getSignedUrl(path: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("certificados").createSignedUrl(path, 300);
  if (error || !data) {
    console.error("[wealth-academy] falha ao gerar link do certificado:", error);
    return null;
  }
  return data.signedUrl;
}

function siteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const certificate = await getCertificate(params.numero);
  const studentName = Array.isArray(certificate?.students)
    ? certificate?.students[0]?.name
    : certificate?.students?.name;

  if (!certificate || !studentName) {
    return { title: "Certificado não encontrado" };
  }

  const siteUrl = siteBaseUrl();
  const pageUrl = `${siteUrl}/validar/${certificate.certificate_number}`;
  const imageUrl = `${siteUrl}/api/validar/${certificate.certificate_number}/imagem`;
  const title = `${studentName} concluiu a formação ${certificate.course_title} — Wealth Academy`;
  const description = `Certificado ${certificate.certificate_number}, emitido pela Wealth Academy em ${new Date(certificate.issue_date).toLocaleDateString("pt-PT")}.`;

  return {
    title: `Certificado de ${studentName}`,
    description,
    openGraph: {
      type: "website",
      url: pageUrl,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ValidarCertificadoPage({ params }: Props) {
  const certificate = await getCertificate(params.numero);
  const studentName = Array.isArray(certificate?.students)
    ? certificate?.students[0]?.name
    : certificate?.students?.name;
  const hasFile = Boolean(certificate?.file_path);
  const previewUrl = certificate?.preview_path ? await getSignedUrl(certificate.preview_path) : null;

  const siteUrl = siteBaseUrl();
  const pageUrl = `${siteUrl}/validar/${params.numero}`;

  return (
    <section className="py-24 print:py-0">
      <div className="container-page print:max-w-none print:px-0">
        {certificate && studentName ? (
          <>
            <div className="mx-auto max-w-3xl text-center print:hidden">
              <p className="eyebrow">Certificado Wealth Academy</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ShareLinkedInButton url={pageUrl} />
                <DownloadCertificateButton href={`/api/validar/${certificate.certificate_number}/ficheiro`} />
              </div>
            </div>
            <div className="mt-8 print:mt-0">
              {hasFile ? (
                <CertificateFilePreview
                  previewUrl={previewUrl}
                  downloadHref={`/api/validar/${certificate.certificate_number}/ficheiro`}
                  studentName={studentName}
                  courseTitle={certificate.course_title}
                  certificateNumber={certificate.certificate_number}
                  issueDate={certificate.issue_date}
                />
              ) : (
                <div className="mx-auto max-w-lg rounded border border-ink/10 bg-white/60 p-10 text-center">
                  <p className="text-sm text-ink-soft">
                    O certificado ainda não foi anexado pela equipa Wealth Academy — volte a tentar em breve.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-lg rounded border border-ink/10 bg-white/60 p-10 text-center">
            <p className="eyebrow">Certificado Wealth Academy</p>
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
