"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CloseTurmaButton({ turmaId }: { turmaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleClose() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/empresas/turmas/${turmaId}/fechar`, { method: "POST" });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível fechar a turma.");
      return;
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mt-2">
        <p className="text-xs text-ink-soft">
          Confirma? A turma fica sem o desconto de 5% e segue para facturação assim como está.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/40"
          >
            {loading ? "A fechar..." : "Sim, fechar sem desconto"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded border border-transparent px-3 py-1.5 text-xs text-ink-soft hover:text-ink"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="mt-2 rounded border border-ink/15 px-3 py-1.5 text-xs text-ink-soft hover:border-ink/30 hover:text-ink"
    >
      Fechar turma incompleta (sem desconto)
    </button>
  );
}
