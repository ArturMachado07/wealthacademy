import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Actualiza o preço/data de uma formação (tabela course_pricing) — o resto
// dos dados do curso continua em src/data/courses.ts. Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug;
  const investment = body?.investment?.trim() || null;
  const date = body?.date?.trim() || null;

  if (!courseSlug) {
    return NextResponse.json({ ok: false, error: "Formação em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("course_pricing")
    .upsert(
      { course_slug: courseSlug, investment, date, updated_at: new Date().toISOString() },
      { onConflict: "course_slug" }
    );

  if (error) {
    console.error("[admin/course-pricing] falha ao guardar:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
