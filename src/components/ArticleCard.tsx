import type { Article } from "@/data/articles";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col rounded border border-ink/10 bg-white/60 p-6">
      <span className="eyebrow">{article.category}</span>
      <h3 className="mt-2 text-lg font-medium text-ink">{article.title}</h3>
      <p className="mt-2 text-sm text-ink-soft">{article.excerpt}</p>
      <div className="mt-4 flex gap-3 text-xs text-ink-soft">
        <span>{article.author}</span>
        <span>·</span>
        <span>{article.date}</span>
        <span>·</span>
        <span>{article.readingTime}</span>
      </div>
    </article>
  );
}
