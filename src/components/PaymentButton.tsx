"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";

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

// Métodos mostrados no popup de escolha. Só o Multicaixa Express está de
// facto ligado (ProxyPay/EMIS GPO) — os restantes ficam visíveis, mas
// claramente marcados como "Brevemente" e não seleccionáveis, para o aluno
// saber o que vem a seguir sem nunca pensar que escolheu um método que na
// realidade seguia por outro caminho (auditoria de pré-lançamento, Fase 1).
// Assim que houver um método novo ligado (referência Multicaixa, WhatsApp a
// sério), basta mudar `available` para true — o resto do fluxo já lida com
// qualquer método marcado como disponível.
const PAYMENT_METHODS = [
  {
    id: "mcx",
    label: "Multicaixa Express",
    description: "Recebe uma notificação no telemóvel para confirmar o pagamento.",
    icon: "/brand/icones-pagamento/mult-express.webp",
    available: true,
  },
  {
    id: "referencia",
    label: "Pagamento por Referência",
    description: "Geramos entidade e referência para pagar no Multicaixa ou no seu banco.",
    icon: "/brand/icones-pagamento/multicaixa-referencia.webp",
    available: false,
  },
  {
    id: "ajuda",
    label: "Preciso de ajuda para pagar",
    description: "A nossa equipa ajuda-o a concluir a inscrição pelo WhatsApp.",
    icon: null,
    available: false,
  },
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
        // Sem isto, o cache de router do Next mantinha a versão antiga de
        // /aluno (sem a inscrição nova) até o aluno recarregar a página à
        // força — router.refresh() invalida esse cache para a navegação
        // seguinte, mesmo sendo para outra rota.
        router.refresh();
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
        router.refresh();
      } else if (data.payment.status === "rejected" || data.payment.status === "expired") {
        setStatus("error");
        setError("O pagamento não foi concluído. Tente novamente.");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [status, charge, router]);

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
          <div className="w-full max-w-sm rounded-2xl bg-[#241D18] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide2 text-gold-light">Wealth Academy</p>
                <h3 className="mt-1 text-[17px] font-medium text-cream">Como quer pagar?</h3>
              </div>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                aria-label="Fechar"
                className="text-cream/50 hover:text-cream"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 rounded border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-sm font-medium text-cream">{courseTitle}</p>
              <p className="text-sm text-gold-light">{investment}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {PAYMENT_METHODS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 rounded-[10px] border px-3.5 py-3 ${
                    !option.available
                      ? "cursor-not-allowed border-white/10 opacity-70"
                      : method === option.id
                        ? "cursor-pointer border-gold-light bg-white/[0.06]"
                        : "cursor-pointer border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={method === option.id}
                    disabled={!option.available}
                    onChange={() => option.available && setMethod(option.id)}
                    className="sr-only"
                  />
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[7px] bg-white/[0.06]">
                    {option.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={option.icon} alt="" className="h-full w-full rounded-[7px] object-cover" />
                    ) : (
                      <WhatsAppIcon className="h-[18px] w-[18px] text-gold-light" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-cream">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-cream/60">{option.description}</span>
                  </span>
                  {!option.available && (
                    <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cream/60">
                      Brevemente
                    </span>
                  )}
                </label>
              ))}
            </div>

            <button type="button" onClick={handleClick} className="btn-primary mt-5 w-full">
              Confirmar inscrição
            </button>
            <p className="mt-3 text-center text-[11px] text-cream/50">
              Todas as transacções são seguras e encriptadas. Ao confirmar, aceita os{" "}
              <Link href="/termos" className="underline hover:text-cream" target="_blank">
                Termos e Condições
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
