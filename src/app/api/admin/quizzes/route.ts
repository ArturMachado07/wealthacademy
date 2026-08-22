import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Cria (se ainda não existir) ou actualiza a nota mínima do teste de uma
// aula. Um teste por aula (lesson_id é unique em lesson_quizzes).
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = body?.lessonId;
  const passingScoreRaw = Number(body?.passingScore);
  const passingScore = Number.isFinite(passingScoreRaw)
    ? Math.min(100, Math.max(0, Math.round(passingScoreRaw)))
    : 70;

  if (!lessonId) {
    return NextResponse.json({ ok: false, error: "Aula em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lesson_quizzes")
    .upsert({ lesson_id: lessonId, passing_score: passingScore }, { onConflict: "lesson_id" })
    .select("id")
    .single();

  if (error) {
    console.error("[admin/quizzes] falha ao guardar teste:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o teste." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, quizId: data.id });
}
