export type Partner = {
  name: string;
  description: string;
  logo: string;
};

// Credibilidade institucional — não são todas "certificações".
// INEFOP é a entidade licenciadora oficial (registo 1140.01/LDA./2024).
export const partners: Partner[] = [
  {
    name: "INEFOP",
    description: "Instituto Nacional de Emprego e Formação Profissional — entidade licenciadora (registo 1140.01/LDA./2024).",
    logo: "/brand/Logos_credibilidade-institucional.webp",
  },
  {
    name: "INAPEM",
    description: "Referência institucional associada à valorização do talento e das iniciativas nacionais.",
    logo: "/brand/Logos_credibilidade-institucional.webp",
  },
  {
    name: "Feito em Angola",
    description: "Selo de identidade nacional.",
    logo: "/brand/Logos_credibilidade-institucional.webp",
  },
];
