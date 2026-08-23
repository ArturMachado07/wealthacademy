"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  title: string;
  description: string;
  duration: string;
  admission: string;
  date: string;
  location: string;
  certification: string;
  extras: string;
  image: string;
  investment: string;
};

export default function CourseContentForm({
  courseSlug,
  initial,
  placeholders,
}: {
  courseSlug: string;
  initial: Initial;
  placeholders: Initial;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial);
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

    const res = await fetch("/api/admin/course-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        ...form,
        extras: form.extras
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  const field = (
    key: keyof Initial,
    label: string,
    opts?: { textarea?: boolean; rows?: number }
  ) => (
    <div>
      <label className="block text-xs text-ink-soft">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholders[key]}
          rows={opts.rows ?? 3}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholders[key]}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-ink-soft">
        Deixe um campo em branco para usar o valor definido no código (mostrado como sugestão em cinza).
      </p>

      {field("title", "Título")}
      {field("description", "Descrição", { rows: 4 })}

      <div className="grid gap-4 sm:grid-cols-2">
        {field("duration", "Carga Horária")}
        {field("admission", "Admissão")}
        {field("date", "Data")}
        {field("location", "Local")}
        {field("certification", "Certificação")}
        {field("investment", "Preço (Investimento)")}
      </div>

      {field("extras", "Inclui (um item por linha)", { rows: 3 })}
      {field("image", "Banner (nome-base em /public/images)")}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "A guardar..." : "Guardar conteúdo"}
        </button>
        {saved && <p className="text-xs text-gold-dark">Guardado.</p>}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
