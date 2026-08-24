import { siteConfig } from "@/data/site";
import type { Workshop } from "@/lib/workshops";

// Dados estruturados schema.org/Event — elegibilidade para o Google
// mostrar um cartão de evento (data/local) directamente na pesquisa.
// Só é emitido quando há uma `event_date` real (ISO) definida pelo Admin
// — o Google exige startDate em ISO 8601 para o Event ser válido, e o
// campo `date` de texto livre (ex. "28 de Fevereiro e 7 de Março") não dá
// para converter com segurança. Sem event_date, a página continua
// perfeitamente indexável — só não ganha o cartão de evento.
export default function WorkshopJsonLd({ workshop }: { workshop: Workshop }) {
  if (!workshop.event_date || workshop.status === "Realizado") return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";
  const startDate = workshop.time ? `${workshop.event_date}T${normalizeTime(workshop.time)}` : workshop.event_date;

  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: workshop.title,
    startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description: workshop.description ?? workshop.title,
    image: workshop.flyer_url ? [workshop.flyer_url] : undefined,
    url: `${siteUrl}/workshops/${workshop.slug}`,
    organizer: {
      "@type": "EducationalOrganization",
      name: siteConfig.name,
      url: siteUrl,
    },
    ...(workshop.location
      ? { location: { "@type": "Place", name: workshop.location } }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// "14h00" / "14:00" → "14:00:00" (formato exigido no ISO 8601). Se não
// conseguir reconhecer o formato, ignora a hora em vez de gerar uma data
// inválida.
function normalizeTime(time: string): string {
  const match = time.match(/(\d{1,2})[h:](\d{2})?/);
  if (!match) return "00:00:00";
  const hours = match[1].padStart(2, "0");
  const minutes = (match[2] ?? "00").padStart(2, "0");
  return `${hours}:${minutes}:00`;
}
