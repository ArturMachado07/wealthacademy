import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import WorkshopsList from "@/components/WorkshopsList";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Workshops práticos e concentrados da Wealth Academy, filtráveis por área de formação.",
};

export default function WorkshopsPage() {
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Workshops"
          title="Aprendizagem prática e concentrada"
          description="Sessões focadas em temas específicos, com data, local, formador e vagas."
        />
        <div className="mt-14">
          <WorkshopsList />
        </div>
      </div>
    </section>
  );
}
