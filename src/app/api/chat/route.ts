import { NextResponse } from "next/server";
import { buildKnowledgeContext, CHAT_SYSTEM_PROMPT_HEADER } from "@/lib/chat/knowledge";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Chat da Wealth Academy, alimentado pela API da Anthropic. Chamamos a API
// directamente via fetch (sem SDK) para não depender de mais um pacote npm.
//
// Sem ANTHROPIC_API_KEY definida, devolve "not_configured" — o ChatWidget
// no browser trata isso mostrando só o botão clássico do WhatsApp, sem
// mostrar erro nenhum ao visitante (mesmo padrão usado no resto do site
// para Resend/ProxyPay: funciona sem, mais completo com).
const MODEL = process.env.ANTHROPIC_CHAT_MODEL || "claude-haiku-4-5-20251001";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 200 });
  }

  // Cada pedido a este endpoint tem custo real (API da Anthropic) — limite
  // apertado por IP para impedir scripting/abuso (ver src/lib/rate-limit.ts).
  const ip = getClientIp(request);
  if (!checkRateLimit(`chat:${ip}`, 15, 5 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas mensagens em pouco tempo. Tente novamente daqui a alguns minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ ok: false, error: "Mensagem em falta." }, { status: 400 });
  }

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { ok: false, error: "Conversa demasiado longa — recarregue a página para recomeçar." },
      { status: 400 }
    );
  }

  const cleanMessages: ChatMessage[] = [];
  for (const m of messages) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length === 0
    ) {
      return NextResponse.json({ ok: false, error: "Mensagem inválida." }, { status: 400 });
    }
    cleanMessages.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) });
  }

  try {
    const knowledge = await buildKnowledgeContext();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        temperature: 0.4,
        system: `${CHAT_SYSTEM_PROMPT_HEADER}\n\n${knowledge}`,
        messages: cleanMessages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[api/chat] falha na API da Anthropic:", response.status, errBody);
      return NextResponse.json(
        { ok: false, error: "Não foi possível obter resposta agora. Tente novamente." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.content?.[0]?.text;

    if (!reply) {
      return NextResponse.json(
        { ok: false, error: "Não foi possível obter resposta agora. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("[api/chat] erro inesperado:", err);
    return NextResponse.json(
      { ok: false, error: "Não foi possível obter resposta agora. Tente novamente." },
      { status: 500 }
    );
  }
}
