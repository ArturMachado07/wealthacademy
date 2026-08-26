import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNewLeadNotificationEmail } from "@/lib/email";
import { createAdminNotification } from "@/lib/notifications";

// Endpoint de recepção de leads (contacto geral, formulário corporativo,
// lista de interesse da Área do Aluno).
// Se a base de dados Supabase estiver configurada, grava na tabela `leads`
// (ver supabase/schema.sql). Caso contrário, mantém o comportamento
// anterior (regista nos logs) para continuar a funcionar sem BD.
export async function POST(request: Request) {
  // Sem protecção nenhuma antes, um bot conseguia encher a tabela `leads`
  // de lixo — limite generoso (não é um endpoint que um visitante real usa
  // repetidamente) mas suficiente para travar scripting óbvio.
  const ip = getClientIp(request);
  if (!checkRateLimit(`leads:${ip}`, 8, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados pedidos em pouco tempo. Tente novamente daqui a alguns minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || !body.name || !body.email || !body.phone) {
    return NextResponse.json(
      { ok: false, error: "Nome, email e telefone são obrigatórios." },
      { status: 400 }
    );
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("leads").insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      interest: body.interest ?? null,
      origin: body.origin ?? "Website",
      course_slug: body.course ?? null,
      company: body.company ?? null,
      role: body.role ?? null,
      participants: body.participants ?? null,
      training_need: body.trainingNeed ?? null,
      preferred_modality: body.preferredModality ?? null,
      message: body.message ?? null,
    });

    if (error) {
      console.error("[wealth-academy] falha ao gravar lead na BD:", error);
      return NextResponse.json({ ok: false, error: "Não foi possível registar o pedido." }, { status: 500 });
    }

    await createAdminNotification(supabase, {
      title: "Novo lead",
      message: `${body.name} enviou um pedido de contacto (${body.origin ?? "Website"}).`,
      link: "/admin",
    });
  } else {
    console.log("[wealth-academy] novo lead (sem BD configurada):", JSON.stringify(body));
  }

  await sendNewLeadNotificationEmail({
    name: body.name,
    email: body.email,
    phone: body.phone,
    interest: body.interest ?? null,
    origin: body.origin ?? "Website",
    company: body.company ?? null,
    role: body.role ?? null,
    participants: body.participants ?? null,
    trainingNeed: body.trainingNeed ?? null,
    preferredModality: body.preferredModality ?? null,
    message: body.message ?? null,
  });

  return NextResponse.json({ ok: true });
}
