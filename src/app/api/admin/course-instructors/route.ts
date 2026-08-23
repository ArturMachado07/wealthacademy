import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Define a lista completa de formadores ligados a uma formação (substitui
// tudo o que existia antes por esta lista, na ordem enviada — mais simples
// do que gerir cada ligação uma a uma). Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug?.trim();
  const instructorSlugs: string[] = Array.isArray(body?.instructorSlugs)
    ? body.instructorSlugs.map((s: unknown) => String(s).trim()).filter(Boolean)
    : [];

  if (!courseSlug) {
    return NextResponse.json({ ok: false, error: "Formação em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { error: deleteError } = await supabase
    .from("course_instructors")
    .delete()
    .eq("course_slug", courseSlug);

  if (deleteError) {
    console.error("[admin/course-instructors] falha ao limpar ligações:", deleteError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar." }, { status: 500 });
  }

  if (instructorSlugs.length > 0) {
    const rows = instructorSlugs.map((instructor_slug, index) => ({
      course_slug: courseSlug,
      instructor_slug,
      position: index,
    }));
    const { error: insertError } = await supabase.from("course_instructors").insert(rows);
    if (insertError) {
      console.error("[admin/course-instructors] falha ao ligar formadores:", insertError);
      return NextResponse.json({ ok: false, error: "Não foi possível guardar." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
