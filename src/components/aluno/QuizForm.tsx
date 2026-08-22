"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/icons";

type Option = { id: string; option_text: string };
type Question = { id: string; question: string; options: Option[] };

type Result = { score: number; passed: boolean; correctCount: number; totalQuestions: number };

export default function QuizForm({
  quizId,
  questions,
  alreadyPassed,
}: {
  quizId: string;
  questions: Question[];
  alreadyPassed: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [retaking, setRetaking] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (Object.keys(answers).length < questions.length) {
      setError("Responda a todas as perguntas antes de submeter.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/aluno/quiz-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
      }),
    });

    const data = await res.json().catch(() => null);
    setSubmitting(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível submeter o teste.");
      return;
    }

    setResult(data);
    if (data.passed) router.refresh();
  }

  if (alreadyPassed && !retaking) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded border border-gold bg-gold/10 px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-gold-dark">
          <CheckIcon className="h-4 w-4" />
          Teste concluído
        </span>
        <button
          type="button"
          onClick={() => {
            setRetaking(true);
            setResult(null);
            setAnswers({});
          }}
          className="text-xs text-ink-soft underline"
        >
          Repetir teste
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div
        className={`rounded border px-5 py-4 text-sm ${
          result.passed ? "border-gold bg-gold/10 text-ink" : "border-red-200 bg-red-50 text-ink"
        }`}
      >
        <p className="font-medium">
          {result.passed
            ? "Passou no teste!"
            : "Ainda não chegou à nota mínima — pode repetir o teste."}
        </p>
        <p className="mt-1 text-ink-soft">
          {result.correctCount} de {result.totalQuestions} respostas correctas ({result.score}%).
        </p>
        {!result.passed && (
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="btn-secondary mt-4"
          >
            Repetir teste
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded border border-ink/10 bg-white/60 p-5">
      {questions.map((q, i) => (
        <div key={q.id}>
          <p className="text-sm font-medium text-ink">
            {i + 1}. {q.question}
          </p>
          <div className="mt-2 space-y-1.5">
            {q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                  className="accent-gold-dark"
                />
                {opt.option_text}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "A corrigir..." : "Submeter respostas"}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
