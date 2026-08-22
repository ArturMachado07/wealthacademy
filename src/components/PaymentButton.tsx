"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  courseSlug: string;
  courseTitle: string;
  investment: string; // ex. "75.000 Kz"
};

type Status =
  | "idle"
  | "loading"
  | "demo-processing"
  | "awaiting-payment"
  | "success"
  | "already"
  | "error";

function parseAmount(investment: string): number {
  const digits = investment.replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

export default function PaymentButton({ courseSlug, courseTitle, investment }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<{
    qrcodeUrl?: string;
    deeplink?: string;
    paymentId?: string;
  } | null>(null);

  async function handleClick() {
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/payments/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        courseTitle,
        amount: parseAmount(investment),
      }),
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

    // Pagamento real (ProxyPay) — mostra QR-Code/deeplink.
    setCharge({ qrcodeUrl: data.qrcodeUrl, deeplink: data.deeplink, paymentId: data.paymentId });
    setStatus("awaiting-payment");
  }

  if (status === "success" || status === "already") {
    return (
      <div className="rounded border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-ink">
        {status === "success"
          ? "Inscrição confirmada (pagamento em modo demonstração — nenhuma cobrança real foi feita)."
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
      <button type="button" onClick={handleClick} disabled={status === "loading"} className="btn-primary">
        {status === "loading" ? "A processar..." : `Inscrever-me — ${investment}`}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
