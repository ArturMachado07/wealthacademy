"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkshopFlyerUpload({
  slug,
  initialFlyerUrl,
}: {
  slug: string;
  initialFlyerUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [flyerUrl, setFlyerUrl] = useState(initialFlyerUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/workshops/${slug}/flyer`, { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar o flyer.");
      return;
    }

    setFlyerUrl(data.flyerUrl);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded border border-dashed border-ink/20 p-4">
      {flyerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flyerUrl} alt="" className="h-20 w-16 rounded object-cover" />
      ) : (
        <div className="flex h-20 w-16 items-center justify-center rounded border border-ink/10 bg-ink/5 text-[10px] text-ink-soft">
          Sem flyer
        </div>
      )}
      <div>
        <label className="inline-block cursor-pointer whitespace-nowrap rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/40">
          {loading ? "A enviar..." : flyerUrl ? "Alterar flyer" : "Carregar flyer"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>
        <p className="mt-1.5 text-xs text-ink-soft">JPG, PNG ou WEBP, até 8MB.</p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
