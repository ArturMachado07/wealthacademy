export type Testimonial = {
  name: string;
  subtitle: string;
  // URL de incorporação do YouTube (não listado) — ex.
  // "https://www.youtube.com/embed/VIDEO_ID".
  embedUrl: string;
  // Nome-base em /public/images — miniatura mostrada antes de o
  // visitante clicar em reproduzir (nunca carrega o vídeo sozinho).
  photo: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Helmer Garcia",
    subtitle:
      "Responsável por uma unidade de negócios na Aliança Seguros, participou na 3.ª edição do curso de Análise e Negociação no Mercado de Capitais.",
    embedUrl: "https://www.youtube.com/embed/Zb30FcJGeFs",
    photo: "testemunho-frame1",
  },
  {
    name: "Dalila Prata",
    subtitle:
      "Formadora do curso de Comunicação Institucional — um programa pensado para preparar profissionais e organizações para comunicar com estratégia.",
    embedUrl: "https://www.youtube.com/embed/jVWei9C1c8c",
    photo: "testemunho-frame2",
  },
  {
    name: "Mahália Castro",
    subtitle: "Fundadora da The Finance Boutique e da Wealth Academy e Formadora de Mercado de Capitais.",
    embedUrl: "https://www.youtube.com/embed/wI2NR_afXI8",
    photo: "testemunho-frame3",
  },
];
