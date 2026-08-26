import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Devolve a factura da turma (link temporário assinado do storage privado
// "facturas-turmas") — só se a turma pertencer à empresa autenticada e já
// tiver factura anexada pelo Admin. Mesmo padrão de
// /api/aluno/pagamentos/[id]/factura.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { id: turmaId } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: turma } = await supabase
    .from("turmas")
    .select("invoice_path")
    .eq("id", turmaId)
    .eq("company_id", company.id)
    .maybeSingle<{ invoice_path: string | null }>();

  if (!turma?.invoice_path) {
    return NextResponse.json({ ok: false, error: "Factura não encontrada." }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("facturas-turmas")
    .createSignedUrl(turma.invoice_path, 60);

  if (error || !signed) {
    console.error("[empresas/turmas/factura] falha ao gerar link da factura:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível obter a factura." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
