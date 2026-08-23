"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";

export default function AvatarUploadForm({
  name,
  initialAvatarUrl,
}: {
  name: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/aluno/perfil/foto", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar a foto.");
      return;
    }

    setAvatarUrl(data.avatarUrl);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar url={avatarUrl} name={name} size={72} />
      <div>
        <label className="inline-block cursor-pointer whitespace-nowrap rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/40">
          {loading ? "A enviar..." : avatarUrl ? "Alterar foto" : "Carregar foto"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>
        <p className="mt-1.5 text-xs text-ink-soft">JPG, PNG ou WEBP, até 5MB.</p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
