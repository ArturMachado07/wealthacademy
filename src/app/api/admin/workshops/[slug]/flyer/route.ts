import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Upload do flyer de um workshop, directamente do dispositivo do Admin —
// guardado no bucket público "flyers" (mesmo padrão da foto de perfil do
// aluno). Requer que o workshop já exista (criar primeiro os dados de
// texto, depois carregar o flyer).
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { slug } = await context.params;
  const supabase = createSupabaseAdminClient();

  const { data: workshop } = await supabase.from("workshops").select("slug").eq("slug", slug).maybeSingle();
  if (!workshop) {
    return NextResponse.json({ ok: false, error: "Workshop não encontrado." }, { status: 404 });
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
    return NextResponse.json({ ok: false, error: "O flyer não pode ultrapassar 8MB." }, { status: 400 });
  }

  const path = `${slug}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("flyers").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[admin/workshops] falha ao guardar flyer:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o flyer." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("flyers").getPublicUrl(path);
  // Sufixo para invalidar cache do browser/CDN — o caminho não muda entre
  // uploads (upsert), só o conteúdo.
  const flyerUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("workshops")
    .update({ flyer_url: flyerUrl, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (updateError) {
    console.error("[admin/workshops] falha ao actualizar flyer_url:", updateError);
    return NextResponse.json({ ok: false, error: "Flyer guardado, mas o registo falhou." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, flyerUrl });
}
