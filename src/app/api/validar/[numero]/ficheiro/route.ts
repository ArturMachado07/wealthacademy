import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Devolve o certificado (redireccionando para um link temporário assinado
// do storage privado "certificados") a partir do número — público, sem
// sessão, tal como a própria página /validar/[numero]. O ficheiro é a
// digitalização do certificado impresso e assinado pelo INEFOP, anexada
// manualmente pelo Admin (ver /api/admin/inscricoes/[enrollmentId]/certificado).
export async function GET(request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;

  const supabase = createSupabaseAdminClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("file_path")
    .eq("certificate_number", numero)
    .maybeSingle<{ file_path: string | null }>();

  if (!certificate?.file_path) {
    return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  }

  const extension = certificate.file_path.split(".").pop() || "pdf";
  const { data: signed, error } = await supabase.storage
    .from("certificados")
    .createSignedUrl(certificate.file_path, 60, { download: `certificado-${numero}.${extension}` });

  if (error || !signed) {
    console.error("[wealth-academy] falha ao gerar link do certificado:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível obter o certificado." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
