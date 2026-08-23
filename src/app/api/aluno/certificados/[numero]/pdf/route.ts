import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildCertificatePdfBuffer } from "@/lib/pdf";

// Devolve o certificado já em PDF (download directo, sem passar pelo
// diálogo de impressão do browser). RLS ("Aluno vê os próprios
// certificados") já restringe à sessão actual — o filtro por student_id
// aqui é só para não depender só disso.
export async function GET(request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, hours, issue_date")
    .eq("certificate_number", numero)
    .eq("student_id", student.id)
    .maybeSingle<{ certificate_number: string; course_title: string; hours: string | null; issue_date: string }>();

  if (!certificate) {
    return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
  const validateUrl = `${siteUrl.replace(/^https?:\/\//, "")}/validar/${certificate.certificate_number}`;

  const pdf = buildCertificatePdfBuffer({
    studentName: student.name,
    courseTitle: certificate.course_title,
    hours: certificate.hours,
    issueDate: certificate.issue_date,
    certificateNumber: certificate.certificate_number,
    validateUrl,
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.certificate_number}.pdf"`,
      "Content-Length": String(pdf.length),
    },
  });
}
