import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendEnrollmentConfirmationEmail } from "@/lib/email";
import { createNotification, createCompanyNotification } from "@/lib/notifications";

// Upload manual do comprovativo de pagamento de uma turma (transferência
// bancária, tal como as facturas proformas individuais). Ao guardar,
// activa TODAS as inscrições "Pendente" dessa turma de uma vez — os
// colaboradores nunca pagam individualmente, é a empresa que paga a turma
// toda. Só acessível a administradores.
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export async function POST(request: Request, { params }: { params: Promise<{ turmaId: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { turmaId } = await params;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Ficheiro em falta." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Formato não suportado — envie o comprovativo em PDF, PNG ou JPG." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: turma, error: fetchError } = await supabase
    .from("turmas")
    .select("id, company_id, course_title, status")
    .eq("id", turmaId)
    .single();

  if (fetchError || !turma) {
    return NextResponse.json({ ok: false, error: "Turma não encontrada." }, { status: 404 });
  }

  if (turma.status !== "fechada") {
    return NextResponse.json(
      { ok: false, error: "Só é possível anexar comprovativo a uma turma fechada." },
      { status: 400 }
    );
  }

  const path = `${turmaId}/comprovativo.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("facturas-turmas").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[admin/turmas/factura] falha ao guardar comprovativo:", uploadError);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o comprovativo." }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("turmas")
    .update({ status: "paga", invoice_path: path, paid_at: new Date().toISOString() })
    .eq("id", turmaId);

  if (updateError) {
    console.error("[admin/turmas/factura] falha ao actualizar turma:", updateError);
    return NextResponse.json({ ok: false, error: "Comprovativo guardado, mas o registo falhou." }, { status: 500 });
  }

  // Activa em bloco todas as inscrições desta turma — é este o momento em
  // que os colaboradores passam a ter acesso ao conteúdo do curso.
  const { data: members } = await supabase
    .from("enrollments")
    .update({ status: "Em curso", updated_at: new Date().toISOString() })
    .eq("turma_id", turmaId)
    .eq("status", "Pendente")
    .select("student_id, students(name, email)");

  for (const member of members ?? []) {
    const s = Array.isArray(member.students) ? member.students[0] : member.students;
    if (!s) continue;
    await sendEnrollmentConfirmationEmail({ to: s.email, name: s.name, courseTitle: turma.course_title });
    await createNotification(supabase, {
      studentId: member.student_id,
      title: "Inscrição confirmada",
      message: `A sua inscrição em "${turma.course_title}" foi confirmada — a sua empresa concluiu o pagamento da turma.`,
      link: "/aluno",
    });
  }

  await createCompanyNotification(supabase, {
    companyId: turma.company_id,
    title: "Turma activada",
    message: `Recebemos o comprovativo e a turma de "${turma.course_title}" já está activa — os colaboradores têm acesso ao conteúdo.`,
    link: "/empresa",
  });

  return NextResponse.json({ ok: true, activated: members?.length ?? 0 });
}
