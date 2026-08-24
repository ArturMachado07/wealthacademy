import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { alertServerError } from "@/lib/error-alert";

// Marca uma inscrição como "Concluída". Não emite nenhum certificado —
// o certificado só é disponibilizado depois de ser impresso e assinado
// fisicamente pelo INEFOP; o Admin anexa a digitalização à parte, via
// /api/admin/inscricoes/[enrollmentId]/certificado (ver AddWorkshopForm-
// -like CertificateUploadForm em /admin). Só acessível a administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const enrollmentId = body?.enrollmentId;

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
    await alertServerError("admin/concluir-inscricao: concluir inscrição", updateError);
    return NextResponse.json({ ok: false, error: "Não foi possível concluir a inscrição." }, { status: 500 });
  }

  await createNotification(supabase, {
    studentId: enrollment.student_id,
    title: "Formação concluída",
    message: `Concluiu "${enrollment.course_title}". O certificado assinado pelo INEFOP será disponibilizado aqui assim que estiver pronto.`,
    link: "/aluno",
  });

  return NextResponse.json({ ok: true });
}
