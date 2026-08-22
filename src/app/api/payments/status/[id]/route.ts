import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Permite ao browser consultar o estado de um pagamento (polling simples
// enquanto o aluno completa o pagamento no telemóvel), sem depender só do
// webhook. Usa o cliente com RLS (não a service role) — a policy "Aluno vê
// os próprios pagamentos" já garante que só o dono consegue ler a linha;
// a verificação de sessão aqui só serve para devolver um 401 claro em vez
// de um 404 confuso a quem não está autenticado.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, status, amount, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !payment) {
    return NextResponse.json({ ok: false, error: "Pagamento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, payment });
}
