"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddModuleForm({
  courseSlug,
  nextPosition,
}: {
  courseSlug: string;
  nextPosition: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, title, position: nextPosition }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível criar o módulo.");
      return;
    }

    setTitle("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-ink-soft">Novo módulo</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Módulo 1 — Introdução"
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary">
        {loading ? "A adicionar..." : "Adicionar módulo"}
      </button>
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </form>
  );
}
