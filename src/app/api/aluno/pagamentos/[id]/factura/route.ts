import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

// Devolve a factura do pagamento (redireccionando para um link temporário
// assinado do storage privado "facturas") — só se o pagamento pertencer ao
// aluno autenticado e já tiver factura anexada pelo admin.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: paymentId } = await params;
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  // RLS ("Aluno vê os próprios pagamentos") já restringe à sessão actual —
  // o filtro por student_id aqui é só para não depender só disso.
  const supabase = await createSupabaseServerClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("invoice_path")
    .eq("id", paymentId)
    .eq("student_id", student.id)
    .maybeSingle<{ invoice_path: string | null }>();

  if (!payment?.invoice_path) {
    return NextResponse.json({ ok: false, error: "Factura não encontrada." }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const { data: signed, error } = await admin.storage
    .from("facturas")
    .createSignedUrl(payment.invoice_path, 60);

  if (error || !signed) {
    console.error("[wealth-academy] falha ao gerar link da factura:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível obter a factura." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
