"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { insightCategories } from "@/data/categories";

type Initial = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  authorSlug: string;
  date: string;
  readingTime: string;
  photo: string;
  gallery: string;
  body: string;
  source: string;
  sourceUrl: string;
  published: boolean;
};

const EMPTY: Initial = {
  slug: "",
  title: "",
  category: insightCategories[0],
  excerpt: "",
  authorSlug: "",
  date: "",
  readingTime: "",
  photo: "",
  gallery: "",
  body: "",
  source: "",
  sourceUrl: "",
  published: true,
};

export default function ArticleForm({
  authors,
  lockSlug = false,
  initial,
}: {
  authors: { slug: string; name: string }[];
  lockSlug?: boolean;
  initial?: Initial;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial ?? { ...EMPTY, authorSlug: authors[0]?.slug ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    if (!form.slug || !form.title || !form.excerpt || !form.authorSlug || !form.date) {
      setLoading(false);
      setError("Preencha slug, título, resumo, autor e data.");
      return;
    }

    const gallery = form.gallery
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = form.body
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/insights/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.slug,
        title: form.title,
        category: form.category,
        excerpt: form.excerpt,
        authorSlug: form.authorSlug,
        date: form.date,
        readingTime: form.readingTime,
        photo: form.photo,
        gallery,
        body,
        source: form.source,
        sourceUrl: form.sourceUrl,
        published: form.published,
      }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }

    setSaved(true);
    if (!lockSlug) {
      router.push(`/admin/insights/artigos/${form.slug}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            disabled={lockSlug}
            className="mt-1 w-72 rounded border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="mt-1 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            {insightCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-ink-soft">Título</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-ink-soft">Resumo</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Autor</label>
          <select
            value={form.authorSlug}
            onChange={(e) => set("authorSlug", e.target.value)}
            className="mt-1 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            {authors.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Data</label>
          <input
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            placeholder="Ex.: 31 de Março de 2025"
            className="mt-1 w-56 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Tempo de leitura (opcional)</label>
          <input
            value={form.readingTime}
            onChange={(e) => set("readingTime", e.target.value)}
            placeholder="Ex.: 4 min"
            className="mt-1 w-32 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Foto de capa (nome-base em /public/images)</label>
          <input
            value={form.photo}
            onChange={(e) => set("photo", e.target.value)}
            className="mt-1 w-64 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-ink-soft">Galeria (nomes-base separados por vírgula)</label>
          <input
            value={form.gallery}
            onChange={(e) => set("gallery", e.target.value)}
            className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-ink-soft">
          Corpo do artigo (um parágrafo por bloco, separado por linha em branco)
        </label>
        <textarea
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          rows={8}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-ink-soft">Fonte original (se for cobertura de imprensa)</label>
          <input
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-ink-soft">URL da fonte</label>
          <input
            value={form.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Publicado (visível no site)
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "A guardar..." : "Guardar artigo"}
        </button>
        {saved && <p className="text-sm text-gold-dark">Guardado.</p>}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
