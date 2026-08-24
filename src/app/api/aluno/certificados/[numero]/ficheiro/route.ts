import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

// Devolve o certificado do aluno (redireccionando para um link temporário
// assinado do storage privado "certificados") — só se pertencer ao aluno
// autenticado. Mesmo padrão de /api/aluno/pagamentos/[id]/factura.
export async function GET(request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  // RLS ("Aluno vê os próprios certificados") já restringe à sessão actual —
  // o filtro por student_id aqui é só para não depender só disso.
  const supabase = await createSupabaseServerClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("file_path")
    .eq("certificate_number", numero)
    .eq("student_id", student.id)
    .maybeSingle<{ file_path: string | null }>();

  if (!certificate?.file_path) {
    return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const { data: signed, error } = await admin.storage
    .from("certificados")
    .createSignedUrl(certificate.file_path, 60);

  if (error || !signed) {
    console.error("[wealth-academy] falha ao gerar link do certificado:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível obter o certificado." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
