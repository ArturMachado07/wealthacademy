"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteModuleButton({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Eliminar este módulo e todas as suas aulas?")) return;
    setLoading(true);
    await fetch("/api/admin/modules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: moduleId }),
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
      Eliminar módulo
    </button>
  );
}
