import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import CertificateFilePreview from "@/components/CertificateFilePreview";
import DownloadCertificateButton from "@/components/DownloadCertificateButton";
import ShareLinkedInButton from "@/components/ShareLinkedInButton";

type Props = { params: Promise<{ numero: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { numero } = await params;
  return { title: `Certificado ${numero}` };
}

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  hours: string | null;
  issue_date: string;
  file_path: string | null;
  preview_path: string | null;
};

export default async function AlunoCertificadoPage({ params }: Props) {
  const { numero } = await params;
  const student = await getCurrentStudent();
  if (!student) redirect(`/aluno/login?from=/aluno/certificados/${numero}`);

  // RLS ("Aluno vê os próprios certificados") já restringe à sessão actual
  // — o filtro por student_id aqui é só para não depender só disso.
  const supabase = await createSupabaseServerClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, hours, issue_date, file_path, preview_path")
    .eq("certificate_number", numero)
    .eq("student_id", student.id)
    .maybeSingle<CertificateRow>();

  if (!certificate) notFound();

  let previewUrl: string | null = null;
  if (certificate.preview_path) {
    const admin = createSupabaseAdminClient();
    const { data: signed, error } = await admin.storage
      .from("certificados")
      .createSignedUrl(certificate.preview_path, 300);
    if (error) {
      console.error("[wealth-academy] falha ao gerar link do certificado:", error);
    } else {
      previewUrl = signed?.signedUrl ?? null;
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
  const publicPageUrl = `${siteUrl}/validar/${certificate.certificate_number}`;

  return (
    <section className="py-16 print:py-0">
      <div className="container-page print:max-w-none print:px-0">
        <div className="print:hidden">
          <Link href="/aluno" className="text-sm text-ink-soft underline">
            ← O meu Dashboard
          </Link>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Certificado</p>
              <h1 className="mt-2 font-display text-3xl text-ink">{certificate.course_title}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <ShareLinkedInButton url={publicPageUrl} />
              <DownloadCertificateButton href={`/api/aluno/certificados/${certificate.certificate_number}/ficheiro`} />
            </div>
          </div>
        </div>

        <div className="mt-8 print:mt-0">
          {certificate.file_path ? (
            <CertificateFilePreview
              previewUrl={previewUrl}
              downloadHref={`/api/aluno/certificados/${certificate.certificate_number}/ficheiro`}
              studentName={student.name}
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
      </div>
    </section>
  );
}
