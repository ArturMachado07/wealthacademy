import type { Metadata } from "next";
import { quiche, inter } from "@/lib/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import Analytics from "@/components/Analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wealth Academy — Academia de Formação em Finanças e Negócios",
    template: "%s · Wealth Academy",
  },
  description:
    "Capacitação certificada em Finanças e Negócios. Cursos, workshops e programas personalizados para profissionais e organizações em Angola.",
  keywords: [
    "formação em finanças e negócios em Angola",
    "formação profissional Angola",
    "cursos de finanças Angola",
    "cursos de negócios Angola",
    "formação financeira Angola",
    "workshops em Angola",
    "formação corporativa Angola",
  ],
  openGraph: {
    type: "website",
    locale: "pt_AO",
    siteName: "Wealth Academy",
    title: "Wealth Academy — Academia de Formação em Finanças e Negócios",
    description: "Sua distinção, Nossa missão.",
    url: siteUrl,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-AO" className={`${quiche.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Analytics />
        <OrganizationJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget aiEnabled={Boolean(process.env.ANTHROPIC_API_KEY)} />
      </body>
    </html>
  );
}
