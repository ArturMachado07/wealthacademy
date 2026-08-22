import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";

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

  // Este fluxo é só para formações sem preço (ver EnrollButton — só aparece
  // quando course.investment está vazio); confirmamos aqui que o slug é
  // mesmo de uma formação real e sem preço, em vez de confiar no que o
  // browser envia (evita inscrições "fantasma" com slug/título inventados).
  const course = courses.find((c) => c.slug === courseSlug);

  if (!course) {
    return NextResponse.json(
      { ok: false, error: "Formação não encontrada." },
      { status: 404 }
    );
  }

  if (course.investment) {
    return NextResponse.json(
      { ok: false, error: "Esta formação tem custo — use o botão de pagamento." },
      { status: 400 }
    );
  }

  const courseTitle = course.title;

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
