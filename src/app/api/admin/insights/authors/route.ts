import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Cria/actualiza um autor (upsert por slug — reenviar o mesmo slug edita o
// autor existente). Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug?.trim();
  const name = body?.name?.trim();
  const role = body?.role?.trim() || null;
  const bio = body?.bio?.trim() || null;
  const photo = body?.photo?.trim() || null;

  if (!slug || !name) {
    return NextResponse.json({ ok: false, error: "Slug e nome são obrigatórios." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("insight_authors")
    .upsert({ slug, name, role, bio, photo }, { onConflict: "slug" });

  if (error) {
    console.error("[admin/insights/authors] falha ao guardar autor:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o autor." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina um autor (falha se ainda tiver artigos associados — protecção
// via foreign key "on delete restrict").
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Autor em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("insight_authors").delete().eq("slug", slug);

  if (error) {
    console.error("[admin/insights/authors] falha ao eliminar autor:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível eliminar — tem artigos associados." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
