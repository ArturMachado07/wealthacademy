import { sendErrorAlertEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// Alternativa sem dependências a uma ferramenta como o Sentry — não há
// npm disponível para instalar/verificar o SDK do Sentry neste ambiente
// (auditoria de pré-lançamento, Fase 3). Sempre que um ponto crítico do
// site falhar (confirmação de pagamento, emissão de certificado), envia
// um email imediato para a equipa, além do já existente `console.error`
// (que continua a ir para os logs da Vercel).
//
// Não é um substituto completo de uma ferramenta de monitorização a
// sério (sem agregação, sem stack trace navegável, sem alertas por
// Slack/SMS) — mas resolve o problema real apontado na auditoria: "a
// equipa só descobre um erro se for ler os logs manualmente".
export async function alertServerError(context: string, error: unknown) {
  console.error(`[${context}]`, error);

  // No máximo 1 email por local de erro a cada 15 minutos — evita encher
  // a caixa de correio se o mesmo erro repetir em cada pedido.
  if (!checkRateLimit(`error-alert:${context}`, 1, 15 * 60_000)) return;

  const message = error instanceof Error ? error.message : String(error);
  const detail = error instanceof Error ? error.stack : undefined;

  await sendErrorAlertEmail({ context, message, detail });
}
