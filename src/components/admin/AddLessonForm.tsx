"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLessonForm({
  moduleId,
  nextPosition,
}: {
  moduleId: string;
  nextPosition: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoProvider, setVideoProvider] = useState("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [materialsUrl, setMaterialsUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId,
        title,
        description,
        videoProvider,
        videoUrl,
        materialsUrl,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        position: nextPosition,
      }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível criar a aula.");
      return;
    }

    setTitle("");
    setDescription("");
    setVideoUrl("");
    setMaterialsUrl("");
    setDurationMinutes("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-gold-dark underline"
      >
        + Adicionar aula
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded border border-ink/10 bg-cream/60 p-4">
      <div>
        <label className="block text-xs text-ink-soft">Título da aula</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-soft">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Tipo de vídeo</label>
          <select
            value={videoProvider}
            onChange={(e) => setVideoProvider(e.target.value)}
            className="mt-1 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            <option value="youtube">YouTube (link embed)</option>
            <option value="vimeo">Vimeo (link embed)</option>
            <option value="direct">Ficheiro directo (mp4)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-ink-soft">
            URL do vídeo {videoProvider !== "direct" && "(link de incorporação/embed)"}
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={
              videoProvider === "direct"
                ? "https://.../aula1.mp4"
                : "https://www.youtube.com/embed/VIDEO_ID"
            }
            className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Duração (min)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="mt-1 w-24 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-ink-soft">Materiais (link, opcional)</label>
          <input
            value={materialsUrl}
            onChange={(e) => setMaterialsUrl(e.target.value)}
            placeholder="https://.../material.pdf"
            className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "A guardar..." : "Guardar aula"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft underline">
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
