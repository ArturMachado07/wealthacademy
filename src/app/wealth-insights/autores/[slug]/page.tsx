import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getArticlesByAuthor } from "@/lib/wealth-insights";
import ArticleCard from "@/components/ArticleCard";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Autor" };
  return { title: author.name, description: author.bio ?? `Artigos de ${author.name} na Wealth Academy.` };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const authorArticles = await getArticlesByAuthor(author.slug);

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Autor"
          title={author.name}
          description={author.role ?? author.bio ?? undefined}
        />

        <div className="mt-14">
          {authorArticles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {authorArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Ainda sem artigos publicados"
              description="Os artigos deste autor vão aparecer aqui assim que forem publicados."
            />
          )}
        </div>
      </div>
    </section>
  );
}
