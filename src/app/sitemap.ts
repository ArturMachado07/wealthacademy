import type { MetadataRoute } from "next";
import { courses } from "@/data/courses";
import { getArticles } from "@/lib/wealth-insights";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/sobre",
    "/formacoes",
    "/workshops",
    "/empresas",
    "/eventos",
    "/wealth-insights",
    "/contactos",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const courseRoutes = courses.map((course) => ({
    url: `${siteUrl}/formacoes/${course.slug}`,
    lastModified: new Date(),
  }));

  const articles = await getArticles();
  const articleRoutes = articles.map((article) => ({
    url: `${siteUrl}/wealth-insights/${article.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...courseRoutes, ...articleRoutes];
}
