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
];
