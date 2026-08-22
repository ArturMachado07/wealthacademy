"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddAuthorForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/insights/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, role, bio, photo }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }

    setSlug("");
    setName("");
    setRole("");
    setBio("");
    setPhoto("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-dashed border-ink/20 p-4">
      <p className="text-xs text-ink-soft">
        Adicionar autor (ou reenviar o mesmo slug para editar um já existente).
      </p>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ex.: joao-silva"
            className="mt-1 w-40 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Cargo</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Foto (nome-base em /public/images)</label>
          <input
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            className="mt-1 w-56 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-ink-soft">Bio (opcional)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary">
        {loading ? "A guardar..." : "Guardar autor"}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
