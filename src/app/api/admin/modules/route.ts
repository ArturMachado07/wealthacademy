import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Cria um módulo de conteúdo para uma formação. Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug;
  const title = body?.title?.trim();
  const position = Number.isFinite(body?.position) ? body.position : 0;

  if (!courseSlug || !title) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("course_modules")
    .insert({ course_slug: courseSlug, title, position });

  if (error) {
    console.error("[admin/modules] falha ao criar módulo:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível criar o módulo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina um módulo (e as suas aulas, em cascata).
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Módulo em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("course_modules").delete().eq("id", id);

  if (error) {
    console.error("[admin/modules] falha ao eliminar módulo:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível eliminar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
