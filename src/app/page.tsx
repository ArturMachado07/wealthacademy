import Hero from "@/components/home/Hero";
import PositioningSection from "@/components/home/PositioningSection";
import TrainingSection from "@/components/home/TrainingSection";
import EmpresasSection from "@/components/home/EmpresasSection";
import PartnerLogos from "@/components/PartnerLogos";
import ContactCta from "@/components/home/ContactCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PositioningSection />
      <TrainingSection />
      <EmpresasSection />
      <PartnerLogos />
      <ContactCta />
    </>
  );
}
