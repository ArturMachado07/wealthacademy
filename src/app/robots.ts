import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/api/",
        "/admin",
        "/aluno",
        "/recuperar-password",
        "/redefinir-password",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
