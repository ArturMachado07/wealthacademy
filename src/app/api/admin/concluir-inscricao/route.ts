import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Marca uma inscrição como "Concluída" e emite o certificado
// correspondente (número gerado automaticamente — ver
// supabase/004_certificate_numbering.sql). Só acessível a administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const enrollmentId = body?.enrollmentId;
  const hours = body?.hours || null;

  if (!enrollmentId) {
    return NextResponse.json({ ok: false, error: "Inscrição em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: enrollment, error: fetchError } = await supabase
    .from("enrollments")
    .select("id, student_id, course_title, status")
    .eq("id", enrollmentId)
    .single();

  if (fetchError || !enrollment) {
    return NextResponse.json({ ok: false, error: "Inscrição não encontrada." }, { status: 404 });
  }

  if (enrollment.status === "Concluída") {
    return NextResponse.json({ ok: true, alreadyDone: true });
  }

  const { error: updateError } = await supabase
    .from("enrollments")
    .update({ status: "Concluída", progress_percent: 100, updated_at: new Date().toISOString() })
    .eq("id", enrollmentId);

  if (updateError) {
    console.error("[wealth-academy] falha ao concluir inscrição:", updateError);
    return NextResponse.json({ ok: false, error: "Não foi possível concluir a inscrição." }, { status: 500 });
  }

  const { error: certError } = await supabase.from("certificates").insert({
    student_id: enrollment.student_id,
    enrollment_id: enrollment.id,
    course_title: enrollment.course_title,
    hours,
  });

  if (certError) {
    console.error("[wealth-academy] falha ao emitir certificado:", certError);
    return NextResponse.json(
      { ok: false, error: "Inscrição concluída, mas o certificado falhou." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
