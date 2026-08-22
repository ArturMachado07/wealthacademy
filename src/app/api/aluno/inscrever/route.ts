import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Inscrição self-service de um aluno autenticado numa formação. Não depende
// de pagamento (essa integração ainda não está ligada) — cria a inscrição
// directamente com estado "Em curso". Quando os pagamentos estiverem
// activos, este fluxo deve passar a criar a inscrição só depois da
// confirmação do pagamento (ver src/lib/payments/proxypay.ts).
export async function POST(request: Request) {
  const student = await getCurrentStudent();

  if (!student) {
    return NextResponse.json(
      { ok: false, error: "not_authenticated" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug;
  const courseTitle = body?.courseTitle;

  if (!courseSlug || !courseTitle) {
    return NextResponse.json(
      { ok: false, error: "Dados da formação em falta." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", student.id)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyEnrolled: true });
  }

  const { error } = await supabase.from("enrollments").insert({
    student_id: student.id,
    course_slug: courseSlug,
    course_title: courseTitle,
    status: "Em curso",
    progress_percent: 0,
  });

  if (error) {
    console.error("[wealth-academy] falha ao criar inscrição:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível concluir a inscrição." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
