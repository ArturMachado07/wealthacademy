import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Upload manual da factura (emitida no sistema de facturação externo da
// empresa — este site não emite facturas fiscais) associada a um
// pagamento já aceite. Só acessível a administradores. Guarda o ficheiro
// no bucket privado "facturas" e regista o caminho em payments.invoice_path
// — o aluno só consegue aceder via /api/aluno/pagamentos/[id]/factura, que
// gera um link temporário assinado depois de confirmar que é o dono.
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { id: paymentId } = await params;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Ficheiro em falta." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Formato não suportado — envie a factura em PDF, PNG ou JPG." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, status")
    .eq("id", paymentId)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ ok: false, error: "Pagamento não encontrado." }, { status: 404 });
  }

  const path = `${paymentId}/factura.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("facturas").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[wealth-academy] falha ao guardar factura:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar a factura." }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ invoice_path: path, invoice_uploaded_at: new Date().toISOString() })
    .eq("id", paymentId);

  if (updateError) {
    console.error("[wealth-academy] falha ao actualizar pagamento com a factura:", updateError);
    return NextResponse.json({ ok: false, error: "Factura guardada, mas o registo falhou." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
