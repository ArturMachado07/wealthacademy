import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Devolve o certificado de um colaborador — só se pertencer a uma turma da
// própria empresa autenticada. Sem policy de RLS dedicada (a cadeia
// certificado → inscrição → turma → empresa não dá para expressar numa
// policy simples), por isso a verificação de posse é feita aqui a
// pulso com a service role, nos três passos abaixo. Mesmo padrão de
// redirecção de /api/aluno/certificados/[numero]/ficheiro.
export async function GET(request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("file_path, enrollment_id")
    .eq("certificate_number", numero)
    .maybeSingle<{ file_path: string | null; enrollment_id: string | null }>();

  if (!certificate?.file_path || !certificate.enrollment_id) {
    return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("turma_id")
    .eq("id", certificate.enrollment_id)
    .maybeSingle<{ turma_id: string | null }>();

  if (!enrollment?.turma_id) {
    return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  }

  const { data: turma } = await supabase
    .from("turmas")
    .select("company_id")
    .eq("id", enrollment.turma_id)
    .maybeSingle<{ company_id: string }>();

  if (!turma || turma.company_id !== company.id) {
    return NextResponse.json({ ok: false, error: "Sem permissão para aceder a este certificado." }, { status: 403 });
  }

  const extension = certificate.file_path.split(".").pop() || "pdf";
  const { data: signed, error } = await supabase.storage
    .from("certificados")
    .createSignedUrl(certificate.file_path, 60, { download: `certificado-${numero}.${extension}` });

  if (error || !signed) {
    console.error("[wealth-academy] falha ao gerar link do certificado (empresa):", error);
    return NextResponse.json({ ok: false, error: "Não foi possível obter o certificado." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
