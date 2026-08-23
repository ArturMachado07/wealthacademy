import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Altera a password do próprio aluno autenticado, sem sair da área do
// aluno (alternativa a "Esqueci a senha", que exige email). A sessão
// activa já prova a identidade — supabase.auth.updateUser() não pede a
// password antiga, tal como o resto do fluxo de perfil (ver 008_student_
// profile_update.sql para o padrão equivalente nos dados do perfil).
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "A password deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("[aluno/perfil/senha] falha ao alterar password:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível alterar a password." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
