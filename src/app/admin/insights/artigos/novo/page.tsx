import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "Novo artigo — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminNovoArtigoPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const { data: authors } = await supabase.from("insight_authors").select("slug, name").order("name");

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin/insights" className="text-sm text-ink-soft underline">
          ← Wealth Insights
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Wealth Insights</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Novo artigo</h1>
        </div>

        <div className="mt-10">
          {authors && authors.length > 0 ? (
            <ArticleForm authors={authors} />
          ) : (
            <p className="text-sm text-ink-soft">
              Crie primeiro um autor em{" "}
              <Link href="/admin/insights" className="text-gold-dark underline">
                Wealth Insights
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
