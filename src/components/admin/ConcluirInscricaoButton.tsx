"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConcluirInscricaoButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/concluir-inscricao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível concluir.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/40"
      >
        {loading ? "A concluir..." : "Marcar concluída + emitir certificado"}
      </button>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
