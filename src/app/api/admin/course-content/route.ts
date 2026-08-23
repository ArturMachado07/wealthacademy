import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Actualiza o conteúdo editável de uma formação (tabela course_pricing —
// título, descrição, carga horária, admissão, data, local, certificação,
// inclui, banner e preço). O programa (módulos) e os formadores continuam
// noutro sítio (src/data/courses.ts e course_instructors). Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug?.trim();

  if (!courseSlug) {
    return NextResponse.json({ ok: false, error: "Formação em falta." }, { status: 400 });
  }

  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);
  const extras: string[] | null = Array.isArray(body?.extras)
    ? body.extras.map((item: unknown) => String(item).trim()).filter(Boolean)
    : null;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("course_pricing").upsert(
    {
      course_slug: courseSlug,
      investment: text(body?.investment),
      date: text(body?.date),
      title: text(body?.title),
      description: text(body?.description),
      duration: text(body?.duration),
      admission: text(body?.admission),
      location: text(body?.location),
      certification: text(body?.certification),
      extras: extras && extras.length > 0 ? extras : null,
      image: text(body?.image),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_slug" }
  );

  if (error) {
    console.error("[admin/course-content] falha ao guardar:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
