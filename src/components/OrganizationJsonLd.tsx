import { siteConfig } from "@/data/site";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    slogan: siteConfig.slogan,
    description:
      "Academia de Formação em Finanças e Negócios, licenciada pelo INEFOP (registo 1140.01/LDA./2024).",
    email: siteConfig.emails.geral,
    telephone: siteConfig.phone,
    sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Edifício Maianga Office Park",
      addressLocality: "Maianga, Luanda",
      addressCountry: "AO",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
