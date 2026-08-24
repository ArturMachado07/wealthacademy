// Partilhado entre o CookieBanner e o Analytics — chave usada no
// localStorage e nome do evento disparado quando o consentimento muda,
// para o Analytics activar os scripts na hora, sem precisar de recarregar
// a página.
export const COOKIE_CONSENT_KEY = "wa-cookie-consent";
export const COOKIE_CONSENT_EVENT = "wa-cookie-consent-changed";

export type CookieConsent = "accepted" | "declined";
