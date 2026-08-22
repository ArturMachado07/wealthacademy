"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig, whatsappLink } from "@/data/site";
import { MessageCircleIcon, SendIcon, WhatsAppIcon, XIcon } from "@/components/icons";

type Props = { aiEnabled: boolean };

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Olá! Sou o assistente virtual da Wealth Academy. Posso ajudar com informações sobre as formações — investimento, datas, conteúdos. Para inscrições já feitas ou pagamentos, é melhor falar directamente com a nossa equipa no WhatsApp.",
};

const WHATSAPP_HREF = whatsappLink(
  "Olá, Wealth Academy. Gostaria de obter informações sobre as formações disponíveis."
);

// Bolha flutuante do site. Sem ANTHROPIC_API_KEY configurada (aiEnabled
// false, decidido no servidor em layout.tsx), fica exactamente como o
// antigo botão do WhatsApp — simples, directo, sem esta lógica toda.
export default function ChatWidget({ aiEnabled }: Props) {
  if (!aiEnabled) {
    return (
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Falar no WhatsApp com a ${siteConfig.name}`}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-cream shadow-lg shadow-ink/20 transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    );
  }

  return <ChatPanel />;
}

function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [downForNow, setDownForNow] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next }),
    }).catch(() => null);

    const data = await res?.json().catch(() => null);
    setSending(false);

    if (!res?.ok || !data?.ok) {
      if (data?.error === "not_configured") setDownForNow(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Não consegui responder agora. Fale connosco directamente no WhatsApp — o botão está aqui em baixo.",
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-lg border border-ink/10 bg-cream shadow-lg shadow-ink/20">
          <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide2 text-gold-light">Wealth Academy</p>
              <p className="text-sm font-medium text-cream">Assistente virtual</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="text-cream/70 hover:text-cream"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-gold text-cream"
                    : "bg-white text-ink border border-ink/10"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded border border-ink/10 bg-white px-3 py-2 text-sm text-ink-soft">
                A escrever...
              </div>
            )}
          </div>

          <div className="border-t border-ink/10 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Escreva a sua pergunta..."
                className="h-10 flex-1 rounded border border-ink/15 bg-white px-3 text-sm text-ink outline-none focus:border-gold"
                maxLength={2000}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !input.trim()}
                aria-label="Enviar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gold text-cream disabled:opacity-50"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-gold-dark hover:underline"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {downForNow ? "Falar agora com uma pessoa no WhatsApp" : "Falar com uma pessoa no WhatsApp"}
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar assistente" : "Abrir assistente da Wealth Academy"}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-cream shadow-lg shadow-ink/20 transition-transform hover:scale-105"
      >
        {open ? <XIcon className="h-6 w-6" /> : <MessageCircleIcon className="h-6 w-6" />}
      </button>
    </>
  );
}
