import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const VALID_PROVIDERS = ["youtube", "vimeo", "direct"];

// Cria uma aula dentro de um módulo. Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const moduleId = body?.moduleId;
  const title = body?.title?.trim();
  const description = body?.description?.trim() || null;
  const videoProvider = VALID_PROVIDERS.includes(body?.videoProvider) ? body.videoProvider : "youtube";
  const videoUrl = body?.videoUrl?.trim() || null;
  const materialsUrl = body?.materialsUrl?.trim() || null;
  const durationMinutes = Number.isFinite(body?.durationMinutes) ? body.durationMinutes : null;
  const position = Number.isFinite(body?.position) ? body.position : 0;

  if (!moduleId || !title) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("lessons").insert({
    module_id: moduleId,
    title,
    description,
    video_provider: videoProvider,
    video_url: videoUrl,
    materials_url: materialsUrl,
    duration_minutes: durationMinutes,
    position,
  });

  if (error) {
    console.error("[admin/lessons] falha ao criar aula:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível criar a aula." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina uma aula (e o progresso associado, em cascata).
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Aula em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) {
    console.error("[admin/lessons] falha ao eliminar aula:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível eliminar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
