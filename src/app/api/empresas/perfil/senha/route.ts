import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Altera a password da própria empresa autenticada — mesmo padrão de
// /api/aluno/perfil/senha, só que gated em getCurrentCompany().
export async function POST(request: Request) {
  const company = await getCurrentCompany();
  if (!company) {
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
    console.error("[empresas/perfil/senha] falha ao alterar password:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível alterar a password." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
