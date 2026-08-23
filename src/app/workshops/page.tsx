import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import WorkshopsList from "@/components/WorkshopsList";
import { getWorkshops } from "@/lib/workshops";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Flyers e inscrições dos próximos workshops da Wealth Academy.",
};
export const revalidate = 60;

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Workshops"
          title="Aprendizagem prática e concentrada"
          description="Sessões focadas em temas específicos — consulte o flyer de cada workshop para data, local e inscrição."
        />
        <div className="mt-14">
          <WorkshopsList workshops={workshops} />
        </div>
      </div>
    </section>
  );
}
