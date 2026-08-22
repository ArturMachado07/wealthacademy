export type Testimonial = {
  name: string;
  subtitle: string;
  // Caminho dentro de /public (ex. "videos/testemunho1.mp4").
  video?: string;
  // Nome-base em /public/images, usado como poster do vídeo enquanto não
  // está a reproduzir (mesma lógica de findPublicImage usada no resto do site).
  photo?: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Helmer Garcia",
    subtitle:
      "Responsável por uma unidade de negócios na Aliança Seguros, participou na 3.ª edição do curso de Análise e Negociação no Mercado de Capitais.",
    video: "videos/testemunho1.mp4",
  },
  {
    name: "Dalila Prata",
    subtitle:
      "Formadora do curso de Comunicação Institucional — um programa pensado para preparar profissionais e organizações para comunicar com estratégia.",
    video: "videos/testemunho2.mp4",
  },
  {
    name: "Mahália Castro",
    subtitle: "Fundadora da The Finance Boutique e da Wealth Academy e Formadora de Mercado de Capitais.",
    video: "videos/testemunho3.mp4",
  },
];
