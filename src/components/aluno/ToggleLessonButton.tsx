"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleLessonButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const next = !completed;

    const res = await fetch("/api/aluno/lesson-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: next }),
    });

    setLoading(false);

    if (res.ok) {
      setCompleted(next);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        completed
          ? "rounded border border-gold bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold-dark"
          : "btn-primary"
      }
    >
      {loading ? "A guardar..." : completed ? "✓ Aula concluída" : "Marcar como concluída"}
    </button>
  );
}
