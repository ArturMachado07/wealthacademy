import Link from "next/link";
import type { InsightArticle } from "@/lib/wealth-insights";
import MediaSlot from "@/components/MediaSlot";
import { ArrowRightIcon } from "@/components/icons";

export default function ArticleCard({ article }: { article: InsightArticle }) {
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
          {article.author && <span>{article.author.name}</span>}
          <span>·</span>
          <span>{article.date}</span>
          {article.reading_time && (
            <>
              <span>·</span>
              <span>{article.reading_time}</span>
            </>
          )}
        </div>
        <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold group-hover:underline">
          Ler artigo
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
