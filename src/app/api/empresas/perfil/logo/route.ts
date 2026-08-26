import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Upload do logótipo da própria empresa autenticada, directamente do
// dispositivo dela — guardado no bucket público "logos-empresas" (baixa
// sensibilidade, ao contrário das facturas). Um logo por empresa: cada
// upload substitui o anterior (mesmo caminho, upsert). Mesmo padrão de
// /api/aluno/perfil/foto.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Ficheiro em falta." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Formato não suportado — envie uma imagem em JPG, PNG ou WEBP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "O logótipo não pode ultrapassar 5MB." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const path = `${company.id}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("logos-empresas").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[wealth-academy] falha ao guardar logo da empresa:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o logótipo." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos-empresas").getPublicUrl(path);
  const logoUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_url: logoUrl })
    .eq("id", company.id);

  if (updateError) {
    console.error("[wealth-academy] falha ao actualizar logo_url:", updateError);
    return NextResponse.json({ ok: false, error: "Logótipo guardado, mas o registo falhou." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, logoUrl });
}
