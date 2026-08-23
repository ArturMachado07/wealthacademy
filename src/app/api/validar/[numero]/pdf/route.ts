import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { buildCertificatePdfBuffer } from "@/lib/pdf";

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  hours: string | null;
  issue_date: string;
  students: { name: string } | { name: string }[] | null;
};

// Devolve o certificado já em PDF (download directo) a partir do número —
// público, sem sessão, tal como a página /validar/[numero] que também usa
// a service role para consultar (RLS continua a proteger o acesso via a
// chave pública, mesmo assim).
export async function GET(request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;

  const supabase = createSupabaseAdminClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, hours, issue_date, students(name)")
    .eq("certificate_number", numero)
    .maybeSingle<CertificateRow>();

  const studentName = Array.isArray(certificate?.students)
    ? certificate?.students[0]?.name
    : certificate?.students?.name;

  if (!certificate || !studentName) {
    return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
  const validateUrl = `${siteUrl.replace(/^https?:\/\//, "")}/validar/${certificate.certificate_number}`;
  const pdfUrl = `${siteUrl}/api/validar/${certificate.certificate_number}/pdf`;

  const pdf = buildCertificatePdfBuffer({
    studentName,
    courseTitle: certificate.course_title,
    hours: certificate.hours,
    issueDate: certificate.issue_date,
    certificateNumber: certificate.certificate_number,
    validateUrl,
    pdfUrl,
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.certificate_number}.pdf"`,
      "Content-Length": String(pdf.length),
    },
  });
}
