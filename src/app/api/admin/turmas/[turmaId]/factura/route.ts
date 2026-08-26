import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Upload manual da FACTURA (documento fiscal, emitido no sistema de
// facturação externo) de uma turma já paga — mesmo padrão de
// /api/admin/pagamentos/[id]/factura para pagamentos individuais. O
// pagamento em si (e a activação dos colaboradores) já aconteceu antes
// disto, através do pagamento feito pela própria empresa (ver
// /api/empresas/turmas/[id]/pagar + /api/payments/demo-confirm ou
// /api/payments/webhook) — isto é só o documento para a contabilidade da
// empresa, não activa nada.
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export async function POST(request: Request, { params }: { params: Promise<{ turmaId: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { turmaId } = await params;

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

  const { data: turma, error: fetchError } = await supabase
    .from("turmas")
    .select("id, status")
    .eq("id", turmaId)
    .single();

  if (fetchError || !turma) {
    return NextResponse.json({ ok: false, error: "Turma não encontrada." }, { status: 404 });
  }

  if (turma.status !== "paga") {
    return NextResponse.json(
      { ok: false, error: "Só é possível anexar factura a uma turma já paga pela empresa." },
      { status: 400 }
    );
  }

  const path = `${turmaId}/factura.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("facturas-turmas").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[admin/turmas/factura] falha ao guardar factura:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar a factura." }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("turmas")
    .update({ invoice_path: path, invoice_uploaded_at: new Date().toISOString() })
    .eq("id", turmaId);

  if (updateError) {
    console.error("[admin/turmas/factura] falha ao actualizar turma:", updateError);
    return NextResponse.json({ ok: false, error: "Factura guardada, mas o registo falhou." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
