import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createAdminNotification } from "@/lib/notifications";

// A empresa fecha uma turma antes de chegar a 6 colaboradores — fica sem o
// desconto de 5% (só se aplica a turmas completas), mas permite não ficar à
// espera indefinidamente. Não pode ser desfeito pela empresa: a partir daqui
// segue para facturação pelo Admin, tal como uma turma completa.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { id: turmaId } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: turma, error: fetchError } = await supabase
    .from("turmas")
    .select("id, company_id, course_title, status")
    .eq("id", turmaId)
    .single();

  if (fetchError || !turma) {
    return NextResponse.json({ ok: false, error: "Turma não encontrada." }, { status: 404 });
  }

  if (turma.company_id !== company.id) {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  if (turma.status !== "a_preencher") {
    return NextResponse.json({ ok: false, error: "Esta turma já não está a preencher." }, { status: 400 });
  }

  const { count: memberCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("turma_id", turmaId);

  if (!memberCount || memberCount === 0) {
    return NextResponse.json(
      { ok: false, error: "A turma ainda não tem colaboradores — não há nada para fechar." },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("turmas")
    .update({ status: "fechada", discount_applied: false, closed_at: new Date().toISOString() })
    .eq("id", turmaId);

  if (updateError) {
    console.error("[empresas/turmas/fechar] falha ao fechar turma:", updateError);
    return NextResponse.json({ ok: false, error: "Não foi possível fechar a turma." }, { status: 500 });
  }

  await createAdminNotification(supabase, {
    title: "Turma fechada incompleta",
    message: `${company.name} fechou a turma de "${turma.course_title}" com ${memberCount} colaborador(es), sem desconto — pronta a facturar.`,
    link: "/admin/empresas",
  });

  return NextResponse.json({ ok: true });
}
