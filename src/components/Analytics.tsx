"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookie-consent";

// Google Analytics 4 e Meta Pixel — ambos opcionais e condicionados a
// variáveis de ambiente. Sem NEXT_PUBLIC_GA_MEASUREMENT_ID /
// NEXT_PUBLIC_META_PIXEL_ID definidas, este componente não renderiza nada
// (mesmo padrão de degradação usada para Supabase/ProxyPay/Resend neste
// projecto) — nunca inventamos um ID de acompanhamento.
//
// Além disso, só carrega estes scripts depois de consentimento explícito
// (ver CookieBanner.tsx) — antes disso, ou se o visitante recusar, nenhum
// cookie de analytics é definido (auditoria de pré-lançamento, Fase 3).
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");

    function handleChange() {
      setConsented(localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, handleChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleChange);
  }, []);

  if (!consented) return null;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {pixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
