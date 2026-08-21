import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Quiche Sans — família oficial da marca, ficheiros em /public/fonts.
export const quiche = localFont({
  variable: "--font-quiche",
  display: "swap",
  src: [
    { path: "../../public/fonts/QuicheSans-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/QuicheSans-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../../public/fonts/QuicheSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/QuicheSans-Italic.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/QuicheSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/QuicheSans-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../../public/fonts/QuicheSans-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/QuicheSans-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "../../public/fonts/QuicheSans-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../../public/fonts/QuicheSans-ExtraBoldItalic.woff2", weight: "800", style: "italic" },
    { path: "../../public/fonts/QuicheSans-Black.woff2", weight: "900", style: "normal" },
    { path: "../../public/fonts/QuicheSans-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
});

// Inter — corpo de texto, alta legibilidade em mobile.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
