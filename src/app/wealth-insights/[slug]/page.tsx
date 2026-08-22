import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/wealth-insights";
import MediaSlot from "@/components/MediaSlot";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artigo" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || !article.published) notFound();

  const author = article.author;

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
          {article.reading_time && (
            <>
              <span>·</span>
              <span>{article.reading_time}</span>
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
          {(article.body && article.body.length > 0 ? article.body : [article.excerpt]).map((paragraph, index) => (
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
            {article.source_url && (
              <>
                {" — "}
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold-dark">
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
