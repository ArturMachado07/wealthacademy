import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Cria/actualiza um formador (upsert por slug — reenviar o mesmo slug edita
// o formador existente), à semelhança dos autores do Wealth Insights. Só
// administradores.
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
    .from("instructors")
    .upsert({ slug, name, role, bio, photo }, { onConflict: "slug" });

  if (error) {
    console.error("[admin/instructors] falha ao guardar formador:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o formador." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina um formador (falha se ainda estiver ligado a alguma formação —
// protecção via foreign key "on delete restrict").
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Formador em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("instructors").delete().eq("slug", slug);

  if (error) {
    console.error("[admin/instructors] falha ao eliminar formador:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível eliminar — está ligado a alguma formação." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
