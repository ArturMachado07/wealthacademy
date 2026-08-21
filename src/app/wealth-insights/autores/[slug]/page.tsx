import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authors } from "@/data/authors";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return authors.map((author) => ({ slug: author.slug }));
}

function getAuthor(slug: string) {
  return authors.find((author) => author.slug === slug);
}

export function generateMetadata({ params }: Props): Metadata {
  const author = getAuthor(params.slug);
  if (!author) return { title: "Autor" };
  return { title: author.name, description: author.bio ?? `Artigos de ${author.name} na Wealth Academy.` };
}

export default function AuthorPage({ params }: Props) {
  const author = getAuthor(params.slug);
  if (!author) notFound();

  const authorArticles = articles.filter((article) => article.authorSlug === author.slug);

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Autor"
          title={author.name}
          description={author.role ?? author.bio}
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
