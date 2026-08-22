"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  courseSlug: string;
  courseTitle: string;
  investment: string; // ex. "75.000 Kz"
};

type Status =
  | "idle"
  | "choosing"
  | "loading"
  | "demo-processing"
  | "awaiting-payment"
  | "success"
  | "already"
  | "error";

// Métodos mostrados no popup de escolha — puramente informativos por agora
// (a Wealth Academy só tem o Multicaixa Express/ProxyPay ligado de facto).
// Os restantes ficam visíveis para o aluno perceber o que estará disponível,
// mas seguem sempre o mesmo fluxo (Multicaixa Express) ao confirmar.
const PAYMENT_METHODS = [
  { id: "mcx", label: "Multicaixa Express", badge: "MCX" },
  { id: "card", label: "Cartão Visa / Mastercard", badge: "VISA/MC" },
  { id: "transfer", label: "Transferência bancária", badge: "IBAN" },
] as const;

export default function PaymentButton({ courseSlug, courseTitle, investment }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<{
    qrcodeUrl?: string;
    deeplink?: string;
    paymentId?: string;
  } | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("mcx");

  async function handleClick() {
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/payments/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, courseTitle }),
    });

    if (res.status === 401) {
      router.push(`/aluno/login?from=/formacoes/${courseSlug}`);
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setStatus("error");
      setError(data?.error ?? "Não foi possível iniciar a inscrição.");
      return;
    }

    if (data.alreadyEnrolled) {
      setStatus("already");
      return;
    }

    if (data.demo) {
      // Modo demonstração: simula o tempo de confirmação de um pagamento
      // real antes de o marcar como aceite. Nenhuma cobrança é feita.
      setIsDemo(true);
      setStatus("demo-processing");
      setTimeout(async () => {
        const confirmRes = await fetch("/api/payments/demo-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: data.paymentId }),
        });
        const confirmData = await confirmRes.json().catch(() => null);
        if (!confirmRes.ok || !confirmData?.ok) {
          setStatus("error");
          setError("Não foi possível confirmar o pagamento demo.");
          return;
        }
        setStatus("success");
      }, 1800);
      return;
    }

    // Pagamento real (ProxyPay) — mostra QR-Code/deeplink e passa a
    // verificar periodicamente se o webhook já confirmou o pagamento.
    setCharge({ qrcodeUrl: data.qrcodeUrl, deeplink: data.deeplink, paymentId: data.paymentId });
    setStatus("awaiting-payment");
  }

  // Enquanto aguarda pagamento real, consulta /api/payments/status/[id] de
  // poucos em poucos segundos — assim que o webhook da EMIS confirmar, o
  // ecrã actualiza sozinho sem o aluno ter de recarregar a página.
  useEffect(() => {
    if (status !== "awaiting-payment" || !charge?.paymentId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/status/${charge.paymentId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) return;

      if (data.payment.status === "accepted") {
        setStatus("success");
      } else if (data.payment.status === "rejected" || data.payment.status === "expired") {
        setStatus("error");
        setError("O pagamento não foi concluído. Tente novamente.");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [status, charge]);

  if (status === "success" || status === "already") {
    return (
      <div className="rounded border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-ink">
        {status === "success"
          ? isDemo
            ? "Inscrição confirmada (pagamento em modo demonstração — nenhuma cobrança real foi feita)."
            : "Inscrição confirmada — pagamento recebido com sucesso."
          : "Já está inscrito nesta formação."}{" "}
        <Link href="/aluno" className="font-medium text-gold-dark underline">
          Ver no meu dashboard
        </Link>
      </div>
    );
  }

  if (status === "demo-processing") {
    return (
      <div className="rounded border border-ink/10 bg-white/60 px-5 py-4 text-sm text-ink-soft">
        A confirmar pagamento (modo demonstração)...
      </div>
    );
  }

  if (status === "awaiting-payment" && charge) {
    return (
      <div className="rounded border border-ink/10 bg-white/60 px-5 py-4 text-sm text-ink">
        <p className="font-medium">Concluir pagamento no telemóvel</p>
        {charge.qrcodeUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={charge.qrcodeUrl} alt="QR Code Multicaixa Express" className="mt-3 h-40 w-40" />
        )}
        {charge.deeplink && (
          <a href={charge.deeplink} className="btn-primary mt-3 inline-block">
            Abrir no Multicaixa Express
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setStatus("choosing")}
        disabled={status === "loading"}
        className="btn-primary"
      >
        {status === "loading" ? "A processar..." : `Inscrever-me — ${investment}`}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {status === "choosing" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Escolher forma de pagamento"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4"
        >
          <div className="w-full max-w-sm rounded-lg bg-cream p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide2 text-gold-dark">Wealth Academy</p>
                <h3 className="mt-1 font-display text-lg text-ink">Concluir inscrição</h3>
              </div>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                aria-label="Fechar"
                className="text-ink-soft hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded border border-ink/10 bg-white px-3 py-2">
              <p className="text-sm font-medium text-ink">{courseTitle}</p>
              <p className="text-sm text-gold-dark">{investment}</p>
            </div>

            <p className="mt-4 text-xs text-ink-soft">Forma de pagamento</p>
            <div className="mt-2 flex flex-col gap-2">
              {PAYMENT_METHODS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded border px-3 py-2.5 ${
                    method === option.id ? "border-gold bg-white" : "border-ink/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={method === option.id}
                    onChange={() => setMethod(option.id)}
                    className="accent-gold-dark"
                  />
                  <span className="flex-1 text-sm text-ink">{option.label}</span>
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {option.badge}
                  </span>
                </label>
              ))}
            </div>

            <button type="button" onClick={handleClick} className="btn-primary mt-5 w-full">
              Confirmar inscrição
            </button>
            <p className="mt-3 text-center text-[11px] text-ink-soft">
              Todas as transacções são seguras e encriptadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
