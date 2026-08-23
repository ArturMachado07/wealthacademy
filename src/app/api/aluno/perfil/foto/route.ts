import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Upload da foto de perfil do próprio aluno autenticado, directamente do
// dispositivo dele — guardada no bucket público "avatares" (baixa
// sensibilidade, ao contrário das facturas). Uma foto por aluno: cada
// upload substitui a anterior (mesmo caminho, upsert).
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
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
      { ok: false, error: "Formato não suportado — envie uma foto em JPG, PNG ou WEBP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "A foto não pode ultrapassar 5MB." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const path = `${student.id}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("avatares").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[wealth-academy] falha ao guardar foto de perfil:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar a foto." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatares").getPublicUrl(path);
  // Sufixo para invalidar cache do browser/CDN — o caminho não muda entre
  // uploads (upsert), só o conteúdo, e sem isto a imagem antiga ficaria
  // "presa" em cache depois de trocar a foto.
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("students")
    .update({ avatar_url: avatarUrl })
    .eq("id", student.id);

  if (updateError) {
    console.error("[wealth-academy] falha ao actualizar avatar_url:", updateError);
    return NextResponse.json({ ok: false, error: "Foto guardada, mas o registo falhou." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, avatarUrl });
}
