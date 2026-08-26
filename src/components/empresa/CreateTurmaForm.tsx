"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateTurmaForm({ courses }: { courses: { slug: string; title: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const courseSlug = form.get("courseSlug");

    const res = await fetch("/api/empresas/turmas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível criar a turma.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        + Criar nova turma
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm rounded border border-ink/10 bg-white p-5">
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Formação
        <select
          name="courseSlug"
          required
          className="rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        >
          <option value="" disabled defaultValue="">
            Seleccione
          </option>
          {courses.map((course) => (
            <option key={course.slug} value={course.slug}>
              {course.title}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "A criar..." : "Criar turma"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-ink/20 px-4 py-2 text-sm text-ink hover:border-ink/40"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
