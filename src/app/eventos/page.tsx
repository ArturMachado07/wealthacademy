import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import { events } from "@/data/events";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Calendário de eventos da Wealth Academy — próximos, inscrições abertas e realizados.",
};

export default function EventosPage() {
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Eventos"
          title="Calendário de eventos"
          description="Encontros, sessões abertas e eventos institucionais da Wealth Academy."
        />
        <div className="mt-14">
          {events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem eventos agendados no momento"
              description="Novos eventos serão anunciados aqui e nas redes sociais da Wealth Academy."
            />
          )}
        </div>
      </div>
    </section>
  );
}
