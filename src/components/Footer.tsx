import Link from "next/link";
import Image from "next/image";
import { navigation, siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src="/brand/logo-fundo-escuro.svg"
            alt="Wealth Academy"
            width={200}
            height={80}
            className="h-16 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm text-cream/70">
            {siteConfig.fullName}. {siteConfig.slogan}
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cream/70 underline-offset-4 hover:text-gold-light hover:underline"
            >
              Instagram
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cream/70 underline-offset-4 hover:text-gold-light hover:underline"
            >
              LinkedIn
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
              <a href={`mailto:${siteConfig.emails.geral}`} className="hover:text-gold-light">
                {siteConfig.emails.geral}
              </a>
            </li>
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-gold-light">
                {siteConfig.phone}
              </a>
            </li>
            <li className="text-cream/70">{siteConfig.address}</li>
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
