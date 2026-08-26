import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Permite ao browser consultar o estado de um pagamento (polling simples
// enquanto se completa o pagamento no telemóvel), sem depender só do
// webhook. Serve tanto o aluno (pagamento individual) como a empresa
// (pagamento de turma) — por isso usa a service role com verificação
// explícita do dono, em vez do cliente com RLS (que só tem policy para
// alunos).
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const student = await getCurrentStudent();
  const company = student ? null : await getCurrentCompany();
  if (!student && !company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, status, amount, student_id, company_id, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !payment) {
    return NextResponse.json({ ok: false, error: "Pagamento não encontrado." }, { status: 404 });
  }

  const isOwner = student ? payment.student_id === student.id : payment.company_id === company?.id;
  if (!isOwner) {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, payment });
}
