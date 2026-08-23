import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const VALID_STATUS = ["Em breve", "Inscrições abertas", "Esgotado", "Realizado"];

// Cria/actualiza um workshop (upsert por slug — reenviar o mesmo slug edita
// o workshop existente), à semelhança dos formadores. Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug?.trim();
  const title = body?.title?.trim();
  const category = body?.category?.trim() || null;
  const date = body?.date?.trim() || null;
  const time = body?.time?.trim() || null;
  const location = body?.location?.trim() || null;
  const guest = body?.guest?.trim() || null;
  const status = VALID_STATUS.includes(body?.status) ? body.status : "Em breve";
  const description = body?.description?.trim() || null;
  const registrationLink = body?.registration_link?.trim() || null;

  if (!slug || !title) {
    return NextResponse.json({ ok: false, error: "Slug e título são obrigatórios." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("workshops").upsert(
    {
      slug,
      title,
      category,
      date,
      time,
      location,
      guest,
      status,
      description,
      registration_link: registrationLink,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

  if (error) {
    console.error("[admin/workshops] falha ao guardar workshop:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o workshop." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina um workshop e o respectivo flyer (se existir).
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Workshop em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Tentativa best-effort de limpar o flyer do Storage — não bloqueia a
  // eliminação do registo se falhar (ex.: já não existe ficheiro).
  const { data: existing } = await supabase.from("workshops").select("flyer_url").eq("slug", slug).maybeSingle();
  if (existing?.flyer_url) {
    const match = existing.flyer_url.match(/\/flyers\/([^?]+)/);
    if (match) {
      await supabase.storage.from("flyers").remove([decodeURIComponent(match[1])]);
    }
  }

  const { error } = await supabase.from("workshops").delete().eq("slug", slug);

  if (error) {
    console.error("[admin/workshops] falha ao eliminar workshop:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível eliminar o workshop." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
