import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import AddAuthorForm from "@/components/admin/AddAuthorForm";
import DeleteAuthorButton from "@/components/admin/DeleteAuthorButton";
import DeleteArticleButton from "@/components/admin/DeleteArticleButton";

export const metadata: Metadata = { title: "Wealth Insights — Admin" };
export const dynamic = "force-dynamic";

type AuthorRow = { slug: string; name: string; role: string | null };
type ArticleRow = {
  slug: string;
  title: string;
  category: string;
  date: string;
  published: boolean;
  author_slug: string;
};

export default async function AdminInsightsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const [{ data: authors }, { data: articles }] = await Promise.all([
    supabase.from("insight_authors").select("slug, name, role").order("name"),
    supabase
      .from("insight_articles")
      .select("slug, title, category, date, published, author_slug")
      .order("date", { ascending: false }),
  ]);

  const authorRows = (authors ?? []) as AuthorRow[];
  const articleRows = (articles ?? []) as ArticleRow[];
  const authorName = (slug: string) => authorRows.find((a) => a.slug === slug)?.name ?? slug;

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin" className="text-sm text-ink-soft underline">
          ← Painel Admin
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Wealth Insights</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Autores e artigos</h1>
        </div>

        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-ink">Artigos ({articleRows.length})</h2>
            <Link href="/admin/insights/artigos/novo" className="btn-secondary">
              Novo artigo
            </Link>
          </div>

          {articleRows.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Ainda não há artigos.</p>
          ) : (
            <div className="mt-4 divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
              {articleRows.map((article) => (
                <div key={article.slug} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-ink">
                      {article.title}
                      {!article.published && (
                        <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft">
                          Rascunho
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {article.category} · {authorName(article.author_slug)} · {article.date}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link href={`/admin/insights/artigos/${article.slug}`} className="text-xs text-gold-dark underline">
                      Editar
                    </Link>
                    <DeleteArticleButton slug={article.slug} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-14">
          <h2 className="text-lg font-medium text-ink">Autores ({authorRows.length})</h2>
          {authorRows.length > 0 && (
            <div className="mt-4 divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
              {authorRows.map((author) => (
                <div key={author.slug} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{author.name}</p>
                    <p className="text-xs text-ink-soft">{author.role ?? author.slug}</p>
                  </div>
                  <DeleteAuthorButton slug={author.slug} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <AddAuthorForm />
          </div>
        </div>
      </div>
    </section>
  );
}
