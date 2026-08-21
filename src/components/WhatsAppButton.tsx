import { siteConfig, whatsappLink } from "@/data/site";

export default function WhatsAppButton() {
  const href = whatsappLink(
    "Olá, Wealth Academy. Gostaria de obter informações sobre as formações disponíveis."
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar no WhatsApp com a ${siteConfig.name}`}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-cream shadow-lg shadow-ink/20 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.702 4.607 1.912 6.47L4 29l7.723-1.877A11.94 11.94 0 0 0 16 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3Zm0 21.75c-1.94 0-3.75-.53-5.303-1.454l-.38-.226-4.58 1.113 1.15-4.46-.248-.393A9.71 9.71 0 0 1 5.25 15c0-5.937 4.813-10.75 10.751-10.75 5.937 0 10.75 4.813 10.75 10.75S21.938 24.75 16 24.75Zm5.89-8.07c-.322-.161-1.904-.94-2.2-1.047-.295-.108-.51-.161-.724.161-.215.322-.833 1.047-1.021 1.262-.188.215-.376.242-.698.081-.322-.161-1.36-.501-2.591-1.598-.958-.854-1.605-1.909-1.793-2.231-.188-.322-.02-.496.141-.656.145-.144.322-.376.483-.564.161-.188.215-.322.322-.537.108-.215.054-.403-.027-.564-.081-.161-.724-1.745-.992-2.39-.261-.626-.526-.541-.724-.551-.188-.009-.403-.011-.618-.011-.215 0-.564.081-.86.403-.295.322-1.128 1.102-1.128 2.687 0 1.585 1.155 3.117 1.316 3.332.161.215 2.273 3.47 5.507 4.868.77.332 1.37.531 1.838.679.772.246 1.475.211 2.03.128.619-.092 1.904-.778 2.173-1.529.268-.752.268-1.396.188-1.529-.081-.134-.295-.215-.617-.376Z" />
      </svg>
    </a>
  );
}
