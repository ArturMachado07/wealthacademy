// Dados estruturados schema.org/BreadcrumbList — reutilizável em qualquer
// página com uma hierarquia clara (formação, workshop, artigo, formador),
// para o Google mostrar o caminho de navegação na SERP em vez do URL cru.
export default function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
