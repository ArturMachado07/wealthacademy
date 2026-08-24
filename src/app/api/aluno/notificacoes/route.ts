import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Lista as últimas notificações do próprio aluno autenticado. Usa o
// cliente com RLS (não a service role) — a policy "Aluno vê as próprias
// notificações" já restringe à sessão actual.
export async function GET() {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, link, read, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[aluno/notificacoes] falha ao ler notificações:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível carregar as notificações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notifications: data ?? [] });
}
