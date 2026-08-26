"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/data/site";

type Status =
  | "idle"
  | "choosing"
  | "loading"
  | "demo-processing"
  | "awaiting-payment"
  | "error";

// Mesmas opções mostradas no popup do PaymentButton.tsx (aluno) — aqui só
// muda quem paga (a empresa) e o valor (o da turma toda). O método
// escolhido é só visual (nenhum dos dois altera o backend, tal como no
// PaymentButton do aluno) — o que importa é o aluno/empresa ver o mesmo
// ecrã de confirmação antes de a cobrança arrancar.
const PAYMENT_METHODS = [
  {
    id: "mcx",
    label: "Multicaixa Express",
    description: "Recebe uma notificação no telemóvel para confirmar o pagamento.",
    icon: "/brand/icones-pagamento/mult-express.webp",
  },
  {
    id: "referencia",
    label: "Pagamento por Referência",
    description: "Geramos entidade e referência para pagar no Multicaixa ou no seu banco.",
    icon: "/brand/icones-pagamento/multicaixa-referencia.webp",
  },
] as const;

// Botão de pagamento da turma pela empresa — mesmo mecanismo de
// Multicaixa Express/demo do PaymentButton.tsx do aluno, só que quem paga é
// a empresa e o valor é o da turma toda (não por pessoa). Ao confirmar, a
// activação dos colaboradores é automática (ver /api/payments/demo-confirm
// e /lib/turma-activation) — o Admin só entra depois para anexar a factura.
export default function TurmaPaymentButton({
  turmaId,
  courseTitle,
  amountLabel,
}: {
  turmaId: string;
  courseTitle: string;
  amountLabel: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<{ qrcodeUrl?: string; deeplink?: string; paymentId?: string } | null>(null);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("mcx");

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
      <button
        type="button"
        onClick={() => setStatus("choosing")}
        disabled={status === "loading"}
        className="btn-primary"
      >
        {status === "loading" ? "A processar..." : `Pagar turma — ${amountLabel}`}
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
                <h3 className="mt-1 font-display text-lg text-ink">Pagar turma</h3>
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
              <p className="text-sm text-gold-dark">{amountLabel}</p>
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={option.icon} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{option.description}</span>
                  </span>
                </label>
              ))}

              <a
                href={whatsappLink(
                  `Olá! Preciso de ajuda para pagar a turma de "${courseTitle}" (${amountLabel}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded border border-ink/15 px-3 py-2.5 hover:border-ink/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/10">
                  <WhatsAppIcon className="h-[18px] w-[18px] text-gold-dark" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm text-ink">Preciso de ajuda para pagar</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    A nossa equipa ajuda a concluir o pagamento pelo WhatsApp.
                  </span>
                </span>
              </a>
            </div>

            <button type="button" onClick={handleClick} className="btn-primary mt-5 w-full">
              Confirmar pagamento
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
