import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/invite-code";
import { courses } from "@/data/courses";
import { checkRateLimit } from "@/lib/rate-limit";

// Cria uma nova turma para a empresa autenticada. A turma começa vazia
// ("a_preencher") — os colaboradores entram depois pelo link de convite
// (ver /aluno/turma/[code]).
export async function POST(request: Request) {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  if (!checkRateLimit(`turmas:criar:${company.id}`, 10, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados pedidos em pouco tempo. Tente novamente daqui a alguns minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug;

  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) {
    return NextResponse.json({ ok: false, error: "Formação inválida." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Gera um código único — tenta algumas vezes no caso (muito improvável)
  // de colisão com um código já existente.
  let inviteCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateInviteCode();
    const { data: existing } = await supabase.from("turmas").select("id").eq("invite_code", candidate).maybeSingle();
    if (!existing) {
      inviteCode = candidate;
      break;
    }
  }

  if (!inviteCode) {
    return NextResponse.json({ ok: false, error: "Não foi possível gerar um código de convite." }, { status: 500 });
  }

  const { data: turma, error } = await supabase
    .from("turmas")
    .insert({
      company_id: company.id,
      course_slug: course.slug,
      course_title: course.title,
      invite_code: inviteCode,
    })
    .select("id, course_slug, course_title, invite_code, capacity, status")
    .single();

  if (error || !turma) {
    console.error("[empresas/turmas] falha ao criar turma:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível criar a turma." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, turma });
}
