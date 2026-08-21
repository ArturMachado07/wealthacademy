import Link from "next/link";
import type { Article } from "@/data/articles";
import { authors } from "@/data/authors";

export default function ArticleCard({ article }: { article: Article }) {
  const author = authors.find((a) => a.slug === article.authorSlug);

  return (
    <Link
      href={`/wealth-insights/${article.slug}`}
      className="group flex flex-col rounded border border-ink/10 bg-white/60 p-6 transition-colors hover:border-gold"
    >
      <span className="eyebrow">{article.category}</span>
      <h3 className="mt-2 text-lg font-medium text-ink group-hover:text-gold-dark">{article.title}</h3>
      <p className="mt-2 flex-1 text-sm text-ink-soft">{article.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
        {author && <span>{author.name}</span>}
        <span>·</span>
        <span>{article.date}</span>
        {article.readingTime && (
          <>
            <span>·</span>
            <span>{article.readingTime}</span>
          </>
        )}
      </div>
    </Link>
  );
}
