import { siteConfig, whatsappLink } from "@/data/site";
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";

export default function ContactCta() {
  return (
    <section className="py-24">
      <div className="container-page flex flex-col items-start justify-between gap-8 rounded border border-ink/10 bg-white/50 p-10 md:flex-row md:items-center">
        <div>
          <p className="eyebrow">Contactos</p>
          <h2 className="mt-3 text-2xl font-medium text-ink md:text-3xl">
            Fale com a Wealth Academy
          </h2>
          <div className="mt-4 flex flex-col gap-1.5 text-sm text-ink-soft">
            <a href={`mailto:${siteConfig.emails.geral}`} className="flex items-center gap-2 hover:text-gold-dark">
              <MailIcon className="h-4 w-4 shrink-0" />
              {siteConfig.emails.geral}
            </a>
            <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-gold-dark">
              <PhoneIcon className="h-4 w-4 shrink-0" />
              {siteConfig.phone}
            </a>
            <span className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 shrink-0" />
              {siteConfig.address}
            </span>
          </div>
        </div>
        <a
          href={whatsappLink("Olá, Wealth Academy. Gostaria de obter informações sobre as formações disponíveis.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Falar no WhatsApp
        </a>
      </div>
    </section>
  );
}
