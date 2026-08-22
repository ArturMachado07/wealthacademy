"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CoursePricingForm({
  courseSlug,
  initialInvestment,
  initialDate,
}: {
  courseSlug: string;
  initialInvestment: string;
  initialDate: string;
}) {
  const router = useRouter();
  const [investment, setInvestment] = useState(initialInvestment);
  const [date, setDate] = useState(initialDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/admin/course-pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, investment, date }),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-ink-soft">Preço (Investimento)</label>
        <input
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
          placeholder="Ex.: 75.000 Kz"
          className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-soft">Data</label>
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Ex.: 28 de Fevereiro e 7 de Março"
          className="mt-1 w-64 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary">
        {loading ? "A guardar..." : "Guardar"}
      </button>
      {saved && <p className="text-xs text-gold-dark">Guardado.</p>}
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </form>
  );
}
