import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createAdminNotification, createCompanyNotification } from "@/lib/notifications";

// Um aluno (já com conta própria) entra numa turma de empresa através do
// link de convite. Fica "Pendente" até a empresa pagar a turma toda — ver
// /api/admin/turmas/[turmaId]/factura, que activa todos os membros de uma
// vez. Ao atingir a capacidade (6), a turma fecha automaticamente com
// desconto de 5% (só turmas completas têm desconto).
type TurmaRow = {
  id: string;
  company_id: string;
  course_slug: string;
  course_title: string;
  capacity: number;
  status: "a_preencher" | "fechada" | "paga";
  companies: { name: string } | { name: string }[] | null;
};

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { code } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: turmaData, error: fetchError } = await supabase
    .from("turmas")
    .select("id, company_id, course_slug, course_title, capacity, status, companies(name)")
    .eq("invite_code", code.toUpperCase())
    .maybeSingle();

  const turma = turmaData as TurmaRow | null;

  if (fetchError || !turma) {
    return NextResponse.json({ ok: false, error: "Convite inválido." }, { status: 404 });
  }

  if (turma.status !== "a_preencher") {
    return NextResponse.json(
      { ok: false, error: "Esta turma já não está a aceitar novos colaboradores." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", student.id)
    .eq("course_slug", turma.course_slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: false, error: "Já tem uma inscrição nesta formação." }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("enrollments").insert({
    student_id: student.id,
    course_slug: turma.course_slug,
    course_title: turma.course_title,
    status: "Pendente",
    progress_percent: 0,
    turma_id: turma.id,
  });

  if (insertError) {
    console.error("[aluno/turmas/entrar] falha ao criar inscrição:", insertError);
    return NextResponse.json({ ok: false, error: "Não foi possível entrar na turma." }, { status: 500 });
  }

  const { count: memberCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("turma_id", turma.id);

  const companyName = Array.isArray(turma.companies) ? turma.companies[0]?.name : turma.companies?.name;
  const closed = (memberCount ?? 0) >= turma.capacity;

  if (closed) {
    await supabase
      .from("turmas")
      .update({ status: "fechada", discount_applied: true, closed_at: new Date().toISOString() })
      .eq("id", turma.id);

    await createAdminNotification(supabase, {
      title: "Turma completa",
      message: `${companyName ?? "Uma empresa"} completou a turma de "${turma.course_title}" (6/6) — com 5% de desconto, pronta a facturar.`,
      link: "/admin/empresas",
    });
    await createCompanyNotification(supabase, {
      companyId: turma.company_id,
      title: "Turma completa",
      message: `A turma de "${turma.course_title}" ficou completa (6/6), com 5% de desconto. Aguarde a factura da nossa equipa.`,
      link: "/empresa",
    });
  } else {
    await createCompanyNotification(supabase, {
      companyId: turma.company_id,
      title: "Novo colaborador",
      message: `${student.name} entrou na turma de "${turma.course_title}" (${memberCount}/${turma.capacity}).`,
      link: "/empresa",
    });
  }

  return NextResponse.json({ ok: true, closed });
}
