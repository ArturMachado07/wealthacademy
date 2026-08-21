import Image from "next/image";

export default function PartnerLogos() {
  return (
    <section className="border-y border-ink/10 bg-cream py-16">
      <div className="container-page">
        <p className="eyebrow text-center">Credibilidade Institucional</p>
        <div className="mt-8 flex justify-center">
          <Image
            src="/brand/Logos_credibilidade-institucional.webp"
            alt="Logótipos INEFOP, INAPEM e Feito em Angola"
            width={900}
            height={200}
            className="h-auto w-full max-w-sm object-contain"
          />
        </div>
      </div>
    </section>
  );
}
