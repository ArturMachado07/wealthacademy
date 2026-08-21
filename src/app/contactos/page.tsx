import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { siteConfig, whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Contactos",
  description: "Fale com a Wealth Academy — email, telefone e WhatsApp.",
};

export default function ContactosPage() {
  return (
    <section className="py-24">
      <div className="container-page grid gap-16 md:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading eyebrow="Contactos" title="Fale com a Wealth Academy" />

          <div className="mt-10 space-y-6 text-sm text-ink">
            <div>
              <p className="eyebrow">Email</p>
              <a href={`mailto:${siteConfig.emails.geral}`} className="mt-1 block hover:text-gold-dark">
                {siteConfig.emails.geral}
              </a>
            </div>
            <div>
              <p className="eyebrow">Telefone</p>
              <a href={siteConfig.phoneHref} className="mt-1 block hover:text-gold-dark">
                {siteConfig.phone}
              </a>
            </div>
            <div>
              <p className="eyebrow">Morada</p>
              <p className="mt-1">{siteConfig.address}</p>
            </div>
            <div>
              <p className="eyebrow">Redes sociais</p>
              <div className="mt-1 flex gap-4">
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark">
                  Instagram
                </a>
                <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark">
                  LinkedIn
                </a>
              </div>
            </div>
            <a
              href={whatsappLink("Olá, Wealth Academy. Gostaria de obter informações sobre as formações disponíveis.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-2 inline-flex"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded border border-ink/10 bg-white/60 p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
