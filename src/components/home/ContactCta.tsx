import { siteConfig, whatsappLink } from "@/data/site";

export default function ContactCta() {
  return (
    <section className="py-24">
      <div className="container-page flex flex-col items-start justify-between gap-8 rounded border border-ink/10 bg-white/50 p-10 md:flex-row md:items-center">
        <div>
          <p className="eyebrow">Contactos</p>
          <h2 className="mt-3 text-2xl font-medium text-ink md:text-3xl">
            Fale com a Wealth Academy
          </h2>
          <div className="mt-4 flex flex-col gap-1 text-sm text-ink-soft">
            <a href={`mailto:${siteConfig.emails.geral}`} className="hover:text-gold-dark">
              {siteConfig.emails.geral}
            </a>
            <a href={siteConfig.phoneHref} className="hover:text-gold-dark">
              {siteConfig.phone}
            </a>
            <span>{siteConfig.address}</span>
          </div>
        </div>
        <a
          href={whatsappLink("Olá, Wealth Academy. Gostaria de obter informações sobre as formações disponíveis.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Falar no WhatsApp
        </a>
      </div>
    </section>
  );
}
