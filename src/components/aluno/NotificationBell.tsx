"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellIcon } from "@/components/icons";

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/aluno/notificacoes")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setNotifications(data.notifications);
      })
      .catch(() => null)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    const next = !open;
    setOpen(next);

    // Marca tudo como lido ao abrir — mais simples do que gerir leitura
    // notificação a notificação, e é o comportamento esperado deste tipo
    // de painel (sino de notificações).
    if (next && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetch("/api/aluno/notificacoes/marcar-lidas", { method: "POST" }).catch(() => null);
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={unreadCount > 0 ? `Notificações (${unreadCount} por ler)` : "Notificações"}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gold" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-30 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded border border-ink/10 bg-white shadow-lg">
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="text-sm font-medium text-ink">Notificações</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <p className="px-4 py-6 text-center text-xs text-ink-soft">A carregar...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-ink-soft">Ainda não tem notificações.</p>
            ) : (
              notifications.map((n) => {
                const content = (
                  <div className="border-b border-ink/5 px-4 py-3 text-sm last:border-b-0 hover:bg-cream">
                    <p className="font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink-soft/70">
                      {new Date(n.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
