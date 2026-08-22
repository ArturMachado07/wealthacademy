"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function QuizPassingScoreForm({
  lessonId,
  initialPassingScore,
}: {
  lessonId: string;
  initialPassingScore: number;
}) {
  const router = useRouter();
  const [passingScore, setPassingScore] = useState(String(initialPassingScore));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/admin/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, passingScore: Number(passingScore) }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div>
        <label className="block text-xs text-ink-soft">Nota mínima para passar (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={passingScore}
          onChange={(e) => setPassingScore(e.target.value)}
          className="mt-1 w-28 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary">
        {loading ? "A guardar..." : "Guardar"}
      </button>
      {saved && <p className="text-xs text-gold-dark">Guardado.</p>}
    </form>
  );
}
