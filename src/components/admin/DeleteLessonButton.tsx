"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Eliminar esta aula?")) return;
    setLoading(true);
    await fetch("/api/admin/lessons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lessonId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-red-700 underline"
    >
      Eliminar
    </button>
  );
}
