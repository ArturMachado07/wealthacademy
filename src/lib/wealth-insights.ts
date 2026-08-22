import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { insightCategories } from "@/data/categories";

// Wealth Insights (autores e artigos) vive na base de dados (tabelas
// insight_authors/insight_articles — ver supabase/010_wealth_insights.sql),
// para o Admin conseguir publicar sem deploy. Leitura pública via RLS
// (published = true para artigos).

export type InsightAuthor = {
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
};

export type InsightArticle = {
  slug: string;
  title: string;
  category: (typeof insightCategories)[number];
  excerpt: string;
  date: string;
  reading_time: string | null;
  photo: string | null;
  gallery: string[] | null;
  body: string[] | null;
  source: string | null;
  source_url: string | null;
  published: boolean;
  author: InsightAuthor | null;
};

function normalizeAuthor(raw: unknown): InsightAuthor | null {
  const author = Array.isArray(raw) ? raw[0] : raw;
  return (author as InsightAuthor) ?? null;
}

const ARTICLE_SELECT =
  "slug, title, category, excerpt, date, reading_time, photo, gallery, body, source, source_url, published, author:insight_authors(slug, name, role, bio, photo)";

export async function getArticles(): Promise<InsightArticle[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("insight_articles").select(ARTICLE_SELECT).order("date", { ascending: false });
  return (data ?? []).map((row) => ({ ...row, author: normalizeAuthor(row.author) })) as InsightArticle[];
}

export async function getArticleBySlug(slug: string): Promise<InsightArticle | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("insight_articles").select(ARTICLE_SELECT).eq("slug", slug).maybeSingle();
  if (!data) return null;
  return { ...data, author: normalizeAuthor(data.author) } as InsightArticle;
}

export async function getAuthors(): Promise<InsightAuthor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("insight_authors").select("slug, name, role, bio, photo").order("name");
  return (data ?? []) as InsightAuthor[];
}

export async function getAuthorBySlug(slug: string): Promise<InsightAuthor | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("insight_authors")
    .select("slug, name, role, bio, photo")
    .eq("slug", slug)
    .maybeSingle();
  return (data as InsightAuthor) ?? null;
}

export async function getArticlesByAuthor(authorSlug: string): Promise<InsightArticle[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("insight_articles")
    .select(ARTICLE_SELECT)
    .eq("author_slug", authorSlug)
    .order("date", { ascending: false });
  return (data ?? []).map((row) => ({ ...row, author: normalizeAuthor(row.author) })) as InsightArticle[];
}
