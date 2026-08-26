"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "demo-processing" | "awaiting-payment" | "error";

// Botão de pagamento da turma pela empresa — mesmo mecanismo de
// Multicaixa Express/demo do PaymentButton.tsx do aluno, só que quem paga é
// a empresa e o valor é o da turma toda (não por pessoa). Ao confirmar, a
// activação dos colaboradores é automática (ver /api/payments/demo-confirm
// e /lib/turma-activation) — o Admin só entra depois para anexar a factura.
export default function TurmaPaymentButton({ turmaId, amountLabel }: { turmaId: string; amountLabel: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<{ qrcodeUrl?: string; deeplink?: string; paymentId?: string } | null>(null);

  async function handleClick() {
    setStatus("loading");
    setError(null);

    const res = await fetch(`/api/empresas/turmas/${turmaId}/pagar`, { method: "POST" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setStatus("error");
      setError(data?.error ?? "Não foi possível iniciar o pagamento.");
      return;
    }

    if (data.demo) {
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
        router.refresh();
      }, 1800);
      return;
    }

    setCharge({ qrcodeUrl: data.qrcodeUrl, deeplink: data.deeplink, paymentId: data.paymentId });
    setStatus("awaiting-payment");
  }

  useEffect(() => {
    if (status !== "awaiting-payment" || !charge?.paymentId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/status/${charge.paymentId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) return;

      if (data.payment.status === "accepted") {
        router.refresh();
      } else if (data.payment.status === "rejected" || data.payment.status === "expired") {
        setStatus("error");
        setError("O pagamento não foi concluído. Tente novamente.");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [status, charge, router]);

  if (status === "demo-processing") {
    return <p className="text-sm text-ink-soft">A confirmar pagamento (modo demonstração)...</p>;
  }

  if (status === "awaiting-payment" && charge) {
    return (
      <div className="rounded border border-ink/10 bg-white p-4 text-sm text-ink">
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
        {status === "loading" ? "A processar..." : `Pagar turma — ${amountLabel}`}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
