import { NextResponse } from "next/server";

// Endpoint de recepção de leads (contacto geral e formulário corporativo).
// Fase 1: valida e regista o pedido nos logs do servidor.
// Próximo passo (fora de âmbito nesta fase): ligar a um serviço de email
// (ex. Resend/SMTP) e/ou ao CRM, usando o mesmo payload já estruturado
// em src/data/leads.ts (tipo Lead / CorporateLead).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.name || !body.email || !body.phone) {
    return NextResponse.json(
      { ok: false, error: "Nome, email e telefone são obrigatórios." },
      { status: 400 }
    );
  }

  console.log("[wealth-academy] novo lead:", JSON.stringify(body));

  return NextResponse.json({ ok: true });
}
