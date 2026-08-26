"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function TurmaInvoiceUploadForm({ turmaId }: { turmaId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/turmas/${turmaId}/factura`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível anexar o comprovativo.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <label className="inline-block cursor-pointer whitespace-nowrap rounded bg-gold-dark px-3 py-1.5 text-xs font-medium text-white hover:bg-gold">
        {loading ? "A enviar..." : "Anexar comprovativo"}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
