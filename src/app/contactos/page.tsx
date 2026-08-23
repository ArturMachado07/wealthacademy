import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { siteConfig, whatsappLink } from "@/data/site";
import {
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/icons";

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
              <a href={`mailto:${siteConfig.emails.geral}`} className="mt-1 flex items-center gap-2 hover:text-gold-dark">
                <MailIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                {siteConfig.emails.geral}
              </a>
            </div>
            <div>
              <p className="eyebrow">Telefone</p>
              <a href={siteConfig.phoneHref} className="mt-1 flex items-center gap-2 hover:text-gold-dark">
                <PhoneIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                {siteConfig.phone}
              </a>
            </div>
            <div>
              <p className="eyebrow">Morada</p>
              <p className="mt-1 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                {siteConfig.address}
              </p>
            </div>
            <div>
              <p className="eyebrow">Redes sociais</p>
              <div className="mt-2 flex gap-3">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da Wealth Academy"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold hover:text-gold-dark"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn da Wealth Academy"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold hover:text-gold-dark"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube da Wealth Academy"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold hover:text-gold-dark"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            <a
              href={whatsappLink("Olá, Wealth Academy. Gostaria de obter informações sobre as formações disponíveis.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-2 inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="h-4 w-4" />
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
