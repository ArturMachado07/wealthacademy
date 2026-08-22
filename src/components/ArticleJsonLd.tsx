import { siteConfig } from "@/data/site";
import type { InsightArticle } from "@/lib/wealth-insights";
import { findPublicImage } from "@/lib/media";

const MONTHS: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  março: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

// A data do artigo é texto livre em português (ex. "31 de Março de 2025"),
// pensado para leitura humana — tentamos convertê-la para ISO 8601 para o
// JSON-LD; se o formato não bater certo, omitimos datePublished em vez de
// arriscar uma data errada.
function toIsoDate(date: string): string | null {
  const match = date.match(/(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})/iu);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTHS[monthName.toLowerCase()];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

export default function ArticleJsonLd({ article }: { article: InsightArticle }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";
  const isoDate = toIsoDate(article.date);
  const imageUrl = article.photo ? findPublicImage(article.photo) : null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    ...(isoDate ? { datePublished: isoDate } : {}),
    ...(imageUrl ? { image: `${siteUrl}${imageUrl}` } : {}),
    author: {
      "@type": "Organization",
      name: article.author?.name ?? siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: `${siteUrl}/wealth-insights/${article.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
