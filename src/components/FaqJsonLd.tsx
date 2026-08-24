// Dados estruturados schema.org/FAQPage — só deve ser usado quando as
// mesmas perguntas/respostas já estão visíveis na página (é o que o Google
// exige; marcação "escondida" viola as guidelines e pode penalizar o
// site). Ver uso em /formacoes/[slug]/page.tsx, onde o FAQ já é renderizado.
export default function FaqJsonLd({ faq }: { faq: { question: string; answer: string }[] }) {
  if (!faq || faq.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
