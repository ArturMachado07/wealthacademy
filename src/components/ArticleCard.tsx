import Link from "next/link";
import type { Article } from "@/data/articles";
import { authors } from "@/data/authors";
import MediaSlot from "@/components/MediaSlot";

export default function ArticleCard({ article }: { article: Article }) {
  const author = authors.find((a) => a.slug === article.authorSlug);

  return (
    <Link
      href={`/wealth-insights/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded border border-ink/10 bg-white/60 transition-colors hover:border-gold"
    >
      {article.photo && (
        <MediaSlot baseName={article.photo} alt={article.title} className="aspect-[16/9]" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <span className="eyebrow">{article.category}</span>
        <h3 className="mt-2 text-lg font-medium text-ink group-hover:text-gold-dark">{article.title}</h3>
        <div className="mt-4 flex flex-1 flex-wrap items-end gap-x-3 gap-y-1 text-xs text-ink-soft">
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
      </div>
    </Link>
  );
}
