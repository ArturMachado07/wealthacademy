import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "Editar artigo — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminEditarArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const [{ data: authors }, { data: article }] = await Promise.all([
    supabase.from("insight_authors").select("slug, name").order("name"),
    supabase
      .from("insight_articles")
      .select(
        "slug, title, category, excerpt, author_slug, date, reading_time, photo, gallery, body, source, source_url, published"
      )
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (!article) notFound();

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin/insights" className="text-sm text-ink-soft underline">
          ← Wealth Insights
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Wealth Insights</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{article.title}</h1>
        </div>

        <div className="mt-10">
          <ArticleForm
            authors={authors ?? []}
            lockSlug
            initial={{
              slug: article.slug,
              title: article.title,
              category: article.category,
              excerpt: article.excerpt,
              authorSlug: article.author_slug,
              date: article.date,
              readingTime: article.reading_time ?? "",
              photo: article.photo ?? "",
              gallery: (article.gallery ?? []).join(", "),
              body: (article.body ?? []).join("\n\n"),
              source: article.source ?? "",
              sourceUrl: article.source_url ?? "",
              published: article.published,
            }}
          />
        </div>
      </div>
    </section>
  );
}
