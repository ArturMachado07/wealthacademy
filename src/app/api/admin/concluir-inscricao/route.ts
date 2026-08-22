import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendCertificateEmail } from "@/lib/email";

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

  const { data: certificate, error: certError } = await supabase
    .from("certificates")
    .insert({
      student_id: enrollment.student_id,
      enrollment_id: enrollment.id,
      course_title: enrollment.course_title,
      hours,
    })
    .select("certificate_number")
    .single();

  if (certError) {
    console.error("[wealth-academy] falha ao emitir certificado:", certError);
    return NextResponse.json(
      { ok: false, error: "Inscrição concluída, mas o certificado falhou." },
      { status: 500 }
    );
  }

  const { data: student } = await supabase
    .from("students")
    .select("name, email")
    .eq("id", enrollment.student_id)
    .single();

  if (student && certificate) {
    // Fallback aponta para o domínio Vercel actual (produção real ainda não
    // ligada) — actualizar .env.example/Vercel quando o domínio final
    // (wealthacademy.ao) estiver activo, sem precisar de tocar aqui.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
    await sendCertificateEmail({
      to: student.email,
      name: student.name,
      courseTitle: enrollment.course_title,
      certificateNumber: certificate.certificate_number,
      validateUrl: `${siteUrl}/validar/${certificate.certificate_number}`,
    });
  }

  return NextResponse.json({ ok: true });
}
