"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMPTY_OPTIONS = ["", "", "", ""];

export default function AddQuizQuestionForm({
  quizId,
  nextPosition,
}: {
  quizId: string;
  nextPosition: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(EMPTY_OPTIONS);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const filledOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!question.trim() || filledOptions.length < 2) {
      setError("Escreva a pergunta e pelo menos 2 opções.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/quiz-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId,
        question,
        position: nextPosition,
        options: options
          .map((text, i) => ({ text: text.trim(), isCorrect: i === correctIndex }))
          .filter((o) => o.text.length > 0),
      }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível criar a pergunta.");
      return;
    }

    setQuestion("");
    setOptions(EMPTY_OPTIONS);
    setCorrectIndex(0);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-gold-dark underline">
        + Adicionar pergunta
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded border border-ink/10 bg-cream/60 p-4">
      <div>
        <label className="block text-xs text-ink-soft">Pergunta</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-ink-soft">Opções (marque a correcta)</label>
        <div className="mt-1 space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="accent-gold-dark"
              />
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Opção ${i + 1}`}
                className="flex-1 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "A guardar..." : "Guardar pergunta"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft underline">
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
