"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Initial = { slug: string; name: string; role: string; bio: string; photo: string };

const EMPTY: Initial = { slug: "", name: "", role: "", bio: "", photo: "" };

export default function AddAuthorForm({
  initial,
  lockSlug = false,
}: {
  initial?: Initial;
  lockSlug?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial ?? EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/insights/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }

    if (lockSlug) {
      router.push("/admin/insights");
    } else {
      setForm(EMPTY);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-dashed border-ink/20 p-4">
      <p className="text-xs text-ink-soft">
        {lockSlug
          ? "A editar autor existente — o slug não pode ser alterado aqui."
          : "Adicionar autor (ou reenviar o mesmo slug para editar um já existente)."}
      </p>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            disabled={lockSlug}
            placeholder="ex.: joao-silva"
            className="mt-1 w-40 rounded border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Nome</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Cargo</label>
          <input
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Foto (nome-base em /public/images)</label>
          <input
            value={form.photo}
            onChange={(e) => set("photo", e.target.value)}
            className="mt-1 w-56 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-ink-soft">Bio (opcional)</label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "A guardar..." : "Guardar autor"}
        </button>
        {lockSlug && (
          <a href="/admin/insights" className="text-xs text-ink-soft underline">
            Cancelar
          </a>
        )}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
