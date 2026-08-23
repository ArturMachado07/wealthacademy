import Link from "next/link";
import { navigation, siteConfig } from "@/data/site";
import { InstagramIcon, LinkedinIcon, MailIcon, MapPinIcon, PhoneIcon, YoutubeIcon } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img
            src="/brand/logo-fundo-escuro.svg"
            alt="Wealth Academy"
            width={122}
            height={86}
            className="h-16 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm text-cream/70">
            {siteConfig.fullName}. {siteConfig.slogan}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Wealth Academy"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 hover:border-gold-light hover:text-gold-light"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn da Wealth Academy"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 hover:border-gold-light hover:text-gold-light"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube da Wealth Academy"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 hover:border-gold-light hover:text-gold-light"
            >
              <YoutubeIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-gold-light">Navegação</p>
          <ul className="mt-4 space-y-2.5">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-cream/80 hover:text-gold-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold-light">Contactos</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li>
              <a href={`mailto:${siteConfig.emails.geral}`} className="flex items-center gap-2 hover:text-gold-light">
                <MailIcon className="h-4 w-4 shrink-0 text-cream/50" />
                {siteConfig.emails.geral}
              </a>
            </li>
            <li>
              <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-gold-light">
                <PhoneIcon className="h-4 w-4 shrink-0 text-cream/50" />
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2 text-cream/70">
              <MapPinIcon className="h-4 w-4 shrink-0 text-cream/50" />
              {siteConfig.address}
            </li>
          </ul>

          <p className="eyebrow mt-8 text-gold-light">Credibilidade Institucional</p>
          <p className="mt-3 text-sm text-cream/70">INEFOP · INAPEM · Feito em Angola</p>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Wealth Academy. Todos os direitos reservados.</p>
          <p>Licenciada pelo INEFOP — registo 1140.01/LDA./2024.</p>
        </div>
      </div>
    </footer>
  );
}
