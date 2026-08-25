import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendCertificateEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { renderFirstPdfPageToPng } from "@/lib/pdf-preview";
import { alertServerError } from "@/lib/error-alert";

// Upload manual da digitalização do certificado — já impresso e assinado
// fisicamente pelo INEFOP — associado a uma inscrição concluída. Mesmo
// padrão do upload de facturas (ver /api/admin/pagamentos/[id]/factura):
// guarda o ficheiro no bucket privado "certificados" e cria/actualiza a
// linha em certificates. Só acessível a administradores.
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { enrollmentId } = await params;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Ficheiro em falta." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Formato não suportado — envie o certificado em PDF, PNG ou JPG." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: enrollment, error: fetchError } = await supabase
    .from("enrollments")
    .select("id, student_id, course_title")
    .eq("id", enrollmentId)
    .single();

  if (fetchError || !enrollment) {
    return NextResponse.json({ ok: false, error: "Inscrição não encontrada." }, { status: 404 });
  }

  const path = `${enrollmentId}/certificado.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("certificados").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[wealth-academy] falha ao guardar certificado:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o certificado." }, { status: 500 });
  }

  // Se for PDF, tenta gerar uma imagem da 1ª página para mostrar o
  // certificado directamente na página (ver src/lib/pdf-preview.ts) — nunca
  // deve impedir o upload de se completar: se falhar, o certificado fica
  // disponível na mesma, só sem pré-visualização (mostra um botão de
  // download em vez da imagem).
  let previewPath: string | null = null;
  if (extension === "pdf") {
    try {
      const png = await renderFirstPdfPageToPng(bytes);
      if (png) {
        const candidatePreviewPath = `${enrollmentId}/certificado-preview.png`;
        const { error: previewUploadError } = await supabase.storage
          .from("certificados")
          .upload(candidatePreviewPath, png, { contentType: "image/png", upsert: true });
        if (previewUploadError) {
          await alertServerError(
            "admin/inscricoes/certificado: guardar pré-visualização",
            previewUploadError
          );
        } else {
          previewPath = candidatePreviewPath;
        }
      } else {
        await alertServerError(
          "admin/inscricoes/certificado: gerar pré-visualização",
          new Error("renderFirstPdfPageToPng devolveu null (sem páginas?)")
        );
      }
    } catch (err) {
      await alertServerError("admin/inscricoes/certificado: gerar pré-visualização", err);
    }
  } else {
    // O próprio ficheiro já é uma imagem — serve também de pré-visualização.
    previewPath = path;
  }

  // Já existe uma linha de certificado para esta inscrição (ex.: admin está
  // a substituir o ficheiro)? Actualiza-a em vez de duplicar — o número do
  // certificado, uma vez atribuído, nunca muda.
  const { data: existing } = await supabase
    .from("certificates")
    .select("id, certificate_number")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle<{ id: string; certificate_number: string }>();

  let certificateNumber = existing?.certificate_number ?? null;

  if (existing) {
    const { error: updateError } = await supabase
      .from("certificates")
      .update({ file_path: path, preview_path: previewPath, uploaded_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[wealth-academy] falha ao actualizar certificado:", updateError);
      return NextResponse.json({ ok: false, error: "Certificado guardado, mas o registo falhou." }, { status: 500 });
    }
  } else {
    const { data: created, error: insertError } = await supabase
      .from("certificates")
      .insert({
        student_id: enrollment.student_id,
        enrollment_id: enrollment.id,
        course_title: enrollment.course_title,
        file_path: path,
        preview_path: previewPath,
        uploaded_at: new Date().toISOString(),
      })
      .select("certificate_number")
      .single();

    if (insertError || !created) {
      console.error("[wealth-academy] falha ao criar certificado:", insertError);
      return NextResponse.json({ ok: false, error: "Certificado guardado, mas o registo falhou." }, { status: 500 });
    }

    certificateNumber = created.certificate_number;
  }

  // Só envia email/notificação na primeira vez (upload inicial) — uma
  // substituição de ficheiro não deve gerar um novo aviso ao aluno.
  if (!existing && certificateNumber) {
    const { data: student } = await supabase
      .from("students")
      .select("name, email")
      .eq("id", enrollment.student_id)
      .single();

    if (student) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
      await sendCertificateEmail({
        to: student.email,
        name: student.name,
        courseTitle: enrollment.course_title,
        certificateNumber,
        validateUrl: `${siteUrl}/validar/${certificateNumber}`,
      });
      await createNotification(supabase, {
        studentId: enrollment.student_id,
        title: "Certificado disponível",
        message: `O seu certificado de "${enrollment.course_title}" já está disponível.`,
        link: `/aluno/certificados/${certificateNumber}`,
      });
    }
  }

  return NextResponse.json({ ok: true, certificateNumber });
}
