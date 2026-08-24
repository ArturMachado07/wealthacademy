import type { MetadataRoute } from "next";

// Ficheiro de manifesto (auditoria de pré-lançamento — favicon completo).
// Permite "Adicionar ao ecrã principal" no Android com o ícone e as cores
// correctas, e completa o conjunto de ícones que faltava (só existia
// icon.svg antes).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wealth Academy — Academia de Formação em Finanças e Negócios",
    short_name: "Wealth Academy",
    description: "Capacitação certificada em Finanças e Negócios em Angola.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F6EA",
    theme_color: "#9D743A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
