"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteWorkshopButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("Eliminar este workshop?")) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/workshops", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível eliminar.");
      return;
    }

    router.refresh();
  }

  return (
    <span>
      <button type="button" onClick={handleClick} disabled={loading} className="text-xs text-red-700 underline">
        Eliminar
      </button>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </span>
  );
}
