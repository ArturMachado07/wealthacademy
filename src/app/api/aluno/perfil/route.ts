import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Actualiza o nome/telefone do próprio aluno autenticado. Usa o cliente
// com RLS (não a service role) — a segurança vem da policy "Aluno
// actualiza o próprio registo" (supabase/008_student_profile_update.sql),
// que só permite update onde auth.uid() = auth_user_id.
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const phone = body?.phone?.trim() || null;

  if (!name) {
    return NextResponse.json({ ok: false, error: "O nome é obrigatório." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("students")
    .update({ name, phone })
    .eq("id", student.id);

  if (error) {
    console.error("[aluno/perfil] falha ao actualizar perfil:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar as alterações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
