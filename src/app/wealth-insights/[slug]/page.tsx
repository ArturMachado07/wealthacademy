import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/data/articles";
import { authors } from "@/data/authors";
import MediaSlot from "@/components/MediaSlot";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticle(params.slug);
  if (!article) return { title: "Artigo" };
  return { title: article.title, description: article.excerpt };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const author = authors.find((a) => a.slug === article.authorSlug);

  return (
    <article className="py-24">
      <div className="container-page max-w-3xl">
        <p className="eyebrow">{article.category}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl">{article.title}</h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          {author ? (
            <Link href={`/wealth-insights/autores/${author.slug}`} className="font-medium text-ink hover:text-gold-dark">
              {author.name}
            </Link>
          ) : null}
          <span>·</span>
          <span>{article.date}</span>
          {article.readingTime && (
            <>
              <span>·</span>
              <span>{article.readingTime}</span>
            </>
          )}
        </div>

        {article.photo && (
          <MediaSlot
            baseName={article.photo}
            alt={article.title}
            className="mt-8 aspect-[16/9] rounded"
          />
        )}

        <div className="prose-content mt-10 space-y-5 text-base leading-relaxed text-ink-soft">
          {(article.body ?? [article.excerpt]).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {article.gallery && article.gallery.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {article.gallery.map((image) => (
              <MediaSlot
                key={image}
                baseName={image}
                alt={article.title}
                className="aspect-[4/3] rounded"
              />
            ))}
          </div>
        )}

        {article.source && (
          <p className="mt-10 border-t border-ink/10 pt-6 text-sm text-ink-soft">
            Publicado originalmente em {article.source}
            {article.sourceUrl && (
              <>
                {" — "}
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold-dark">
                  ler no site de origem
                </a>
              </>
            )}
            .
          </p>
        )}
      </div>
    </article>
  );
}
