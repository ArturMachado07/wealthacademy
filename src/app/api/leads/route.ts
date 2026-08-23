import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Endpoint de recepção de leads (contacto geral, formulário corporativo,
// lista de interesse da Área do Aluno).
// Se a base de dados Supabase estiver configurada, grava na tabela `leads`
// (ver supabase/schema.sql). Caso contrário, mantém o comportamento
// anterior (regista nos logs) para continuar a funcionar sem BD.
// Próximo passo (fora de âmbito nesta fase): ligar a um serviço de email
// (ex. Resend/SMTP) para notificar a equipa a cada novo lead.
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
    });

    if (error) {
      console.error("[wealth-academy] falha ao gravar lead na BD:", error);
      return NextResponse.json({ ok: false, error: "Não foi possível registar o pedido." }, { status: 500 });
    }
  } else {
    console.log("[wealth-academy] novo lead (sem BD configurada):", JSON.stringify(body));
  }

  return NextResponse.json({ ok: true });
}
