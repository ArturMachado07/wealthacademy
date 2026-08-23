// Rate limiting simples, em memória, sem dependências novas — suficiente
// para travar abuso óbvio (scripts a martelar um endpoint) em endpoints
// públicos e sensíveis a custo (/api/chat, que paga por pedido à Anthropic)
// ou a spam (/api/leads).
//
// Limitação conhecida: o estado vive na memória da função — em produção na
// Vercel, cada instância/região tem o seu próprio contador, e reinicia a
// cada novo deploy/cold start. Não é uma solução distribuída. Para tráfego
// sério, substituir por algo partilhado (ex. Upstash Redis) — mas isto já
// impede o caso mais comum de abuso (um único cliente a insistir), sem
// exigir nenhuma infraestrutura nova antes do lançamento.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Limpeza ocasional para não acumular entradas antigas indefinidamente.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Devolve true se o pedido está dentro do limite (e conta-o), ou false se
// já excedeu — nesse caso o chamador deve devolver 429.
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
