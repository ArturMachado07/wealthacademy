import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type OptionInput = { text: string; isCorrect: boolean };

// Cria uma pergunta de escolha múltipla com as suas opções, numa única
// chamada. Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const quizId = body?.quizId;
  const question = body?.question?.trim();
  const position = Number.isFinite(body?.position) ? body.position : 0;
  const options: OptionInput[] = Array.isArray(body?.options)
    ? body.options
        .map((o: unknown) => {
          const opt = o as { text?: unknown; isCorrect?: unknown };
          return { text: String(opt?.text ?? "").trim(), isCorrect: Boolean(opt?.isCorrect) };
        })
        .filter((o: OptionInput) => o.text.length > 0)
    : [];

  if (!quizId || !question || options.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Pergunta e pelo menos 2 opções são obrigatórias." },
      { status: 400 }
    );
  }

  if (!options.some((o) => o.isCorrect)) {
    return NextResponse.json(
      { ok: false, error: "Marque qual é a opção correcta." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: questionRow, error: questionError } = await supabase
    .from("quiz_questions")
    .insert({ quiz_id: quizId, question, position })
    .select("id")
    .single();

  if (questionError || !questionRow) {
    console.error("[admin/quiz-questions] falha ao criar pergunta:", questionError);
    return NextResponse.json({ ok: false, error: "Não foi possível criar a pergunta." }, { status: 500 });
  }

  const { error: optionsError } = await supabase.from("quiz_options").insert(
    options.map((o, i) => ({
      question_id: questionRow.id,
      option_text: o.text,
      is_correct: o.isCorrect,
      position: i,
    }))
  );

  if (optionsError) {
    console.error("[admin/quiz-questions] falha ao criar opções:", optionsError);
    // A pergunta já ficou criada — removê-la para não deixar uma pergunta órfã sem opções.
    await supabase.from("quiz_questions").delete().eq("id", questionRow.id);
    return NextResponse.json({ ok: false, error: "Não foi possível criar as opções." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina uma pergunta (e as suas opções, em cascata).
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Pergunta em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);

  if (error) {
    console.error("[admin/quiz-questions] falha ao eliminar pergunta:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível eliminar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
