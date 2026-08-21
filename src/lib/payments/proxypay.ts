// Integração com o Gateway de Pagamentos Online da EMIS via ProxyPay
// (Multicaixa Express). Documentação: https://developer.proxypay.co.ao/opg/v1/
//
// Pré-requisitos (fora do código, do lado do utilizador):
// 1. Aderir ao GPO através do banco que dá suporte à conta da Wealth Academy.
// 2. Obter o POS_ID atribuído pela EMIS e o token Bearer da ProxyPay
//    (sandbox primeiro, produção depois de certificação).
// 3. Definir as variáveis de ambiente abaixo (ver .env.example).

const BASE_URL =
  process.env.PROXYPAY_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://api.proxypay.co.ao"
    : "https://api.sandbox.proxypay.co.ao");

function assertConfigured() {
  if (!process.env.PROXYPAY_API_TOKEN || !process.env.PROXYPAY_POS_ID) {
    throw new Error(
      "ProxyPay não configurado: definir PROXYPAY_API_TOKEN e PROXYPAY_POS_ID."
    );
  }
}

async function proxypayFetch(path: string, init: RequestInit) {
  assertConfigured();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PROXYPAY_API_TOKEN}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ProxyPay ${response.status}: ${body}`);
  }

  return response.json();
}

export type ProxyPayCharge = {
  id: string;
  amount: string;
  status: "active" | "used" | "expired";
  qrcode_url: string;
  qrref: string;
  deeplink: string;
  deeplink_redirect: string;
  created_at: string;
  expires_at: string;
  transaction_id: string | null;
};

// Cria uma "charge" (QR-Code + Deeplink) para o aluno pagar via Multicaixa
// Express. É o fluxo recomendado para pagamentos iniciados a partir do site
// (o aluno digitaliza o QR ou abre o deeplink no telemóvel).
export async function createCharge(params: {
  amount: string; // formato "123.45"
  callbackUrl: string;
  idempotencyKey: string;
}): Promise<ProxyPayCharge> {
  return proxypayFetch("/opg/v1/charges", {
    method: "POST",
    headers: { "Idempotency-Key": params.idempotencyKey },
    body: JSON.stringify({
      pos_id: Number(process.env.PROXYPAY_POS_ID),
      amount: params.amount,
      callback_url: params.callbackUrl,
    }),
  });
}

export async function getCharge(chargeId: string): Promise<ProxyPayCharge> {
  return proxypayFetch(`/opg/v1/charges/${chargeId}`, { method: "GET" });
}

export type ProxyPayTransaction = {
  id: string;
  type: "payment" | "refund" | "authorization" | "cancelation";
  pos_id: number | null;
  parent_transaction_id: string | null;
  charge_id?: string;
  mobile: string | null;
  amount: string | null;
  status: "accepted" | "rejected" | null;
  status_datetime: string | null;
  status_reason: string | null;
};

export async function getTransaction(transactionId: string): Promise<ProxyPayTransaction> {
  return proxypayFetch(`/opg/v1/transactions/${transactionId}`, { method: "GET" });
}
