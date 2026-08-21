export const siteConfig = {
  name: "Wealth Academy",
  fullName: "Wealth Academy — Academia de Formação em Finanças e Negócios",
  slogan: "Sua distinção, Nossa missão.",
  positioning: "Capacitação certificada em Finanças e Negócios",
  phone: "+244 923 733 660",
  phoneHref: "tel:+244923733660",
  whatsappNumber: "244923733660",
  emails: {
    geral: "geral@waca.ao",
    info: "info@wealthacademy.ao",
  },
  social: {
    instagram: "https://www.instagram.com/wealthacademy.ao",
    linkedin: "https://www.linkedin.com/company/wealth-aca-demy/about/",
  },
};

export const navigation = [
  { label: "Início", href: "/" },
  { label: "Sobre Nós", href: "/sobre" },
  { label: "Formações", href: "/formacoes" },
  { label: "Workshops", href: "/workshops" },
  { label: "Para Empresas", href: "/empresas" },
  { label: "Eventos", href: "/eventos" },
  { label: "Wealth Insights", href: "/wealth-insights" },
  { label: "Contactos", href: "/contactos" },
  { label: "Área do Aluno", href: "/area-do-aluno" },
];

export function whatsappLink(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encoded}`;
}
