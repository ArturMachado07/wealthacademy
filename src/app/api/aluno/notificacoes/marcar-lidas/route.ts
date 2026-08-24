import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Marca todas as notificações não lidas do aluno autenticado como lidas —
// RLS ("Aluno marca as próprias notificações como lidas") garante que só
// consegue actualizar as suas próprias.
export async function POST() {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);

  if (error) {
    console.error("[aluno/notificacoes/marcar-lidas] falha:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
