"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT, type CookieConsent } from "@/lib/cookie-consent";

// Banner de cookies — só é necessário porque o Analytics (Google
// Analytics/Meta Pixel) define cookies quando activo. `enabled` (decidido
// no servidor, em layout.tsx, mesmo padrão do ChatWidget/aiEnabled) só é
// true se GA ou Meta Pixel estiverem configurados — sem isso, não há
// cookies de analytics para consentir, por isso o banner nem aparece.
export default function CookieBanner({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const existing = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!existing) setVisible(true);
  }, [enabled]);

  function respond(choice: CookieConsent) {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream px-4 py-4 shadow-lg shadow-ink/10 print:hidden">
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-xs text-ink-soft">
          Usamos cookies para perceber como o site é utilizado (Google Analytics/Meta Pixel, quando activos). Pode
          aceitar ou recusar — a navegação no site funciona da mesma forma em qualquer dos casos. Saiba mais na{" "}
          <Link href="/privacidade" className="underline hover:text-gold-dark">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => respond("declined")}
            className="rounded border border-ink/20 px-4 py-2 text-xs font-medium text-ink hover:border-ink/40"
          >
            Recusar
          </button>
          <button type="button" onClick={() => respond("accepted")} className="btn-primary text-xs">
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
