import type { MetadataRoute } from "next";
import { courses } from "@/data/courses";
import { getArticles } from "@/lib/wealth-insights";
import { getInstructors } from "@/lib/instructors";
import { getWorkshops } from "@/lib/workshops";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy.ao";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/sobre",
    "/formacoes",
    "/workshops",
    "/empresas",
    "/wealth-insights",
    "/formadores",
    "/contactos",
    "/privacidade",
    "/termos",
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

  const instructors = await getInstructors();
  const instructorRoutes = instructors.map((instructor) => ({
    url: `${siteUrl}/formadores/${instructor.slug}`,
    lastModified: new Date(),
  }));

  // Faltavam do sitemap — exactamente as páginas construídas de propósito
  // para serem partilhadas (têm og:image do flyer), por isso vale a pena o
  // Google as indexar directamente.
  const workshops = await getWorkshops();
  const workshopRoutes = workshops.map((workshop) => ({
    url: `${siteUrl}/workshops/${workshop.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...courseRoutes, ...articleRoutes, ...instructorRoutes, ...workshopRoutes];
}
