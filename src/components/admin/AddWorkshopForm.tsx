"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { trainingCategories } from "@/data/categories";

type Initial = {
  slug: string;
  title: string;
  category: string;
  date: string;
  event_date: string;
  time: string;
  location: string;
  guest: string;
  status: string;
  description: string;
  registration_link: string;
};

const EMPTY: Initial = {
  slug: "",
  title: "",
  category: "",
  date: "",
  event_date: "",
  time: "",
  location: "",
  guest: "",
  status: "Em breve",
  description: "",
  registration_link: "",
};

const STATUS_OPTIONS = ["Em breve", "Inscrições abertas", "Esgotado", "Realizado"];

export default function AddWorkshopForm({ initial, lockSlug = false }: { initial?: Initial; lockSlug?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial ?? EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }

    // Depois de gravar (criar ou editar), fica sempre em modo de edição
    // deste workshop — é aqui que aparece o carregamento do flyer.
    router.push(`/admin/workshops?editWorkshop=${form.slug}#workshop-form`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-dashed border-ink/20 p-4">
      <p className="text-xs text-ink-soft">
        {lockSlug
          ? "A editar workshop existente — o slug não pode ser alterado aqui."
          : "Adicionar workshop (ou reenviar o mesmo slug para editar um já existente). Depois de gravar, poderá carregar o flyer."}
      </p>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-ink-soft">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            disabled={lockSlug}
            placeholder="ex.: workshop-investimentos-set"
            className="mt-1 w-56 rounded border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Título</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="mt-1 w-64 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {trainingCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Estado</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="mt-1 w-44 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Data</label>
          <input
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            placeholder="ex.: 12 de Setembro"
            className="mt-1 w-40 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Data real (para o Google)</label>
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => set("event_date", e.target.value)}
            className="mt-1 w-40 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
          <p className="mt-1 w-40 text-[11px] text-ink-soft">
            Opcional — só é usada para o Google mostrar data/local do evento na pesquisa. O texto em &ldquo;Data&rdquo; acima continua a ser o que aparece no site.
          </p>
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Hora</label>
          <input
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            placeholder="ex.: 14h00"
            className="mt-1 w-32 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Local</label>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="ex.: Luanda | Online"
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Convidado</label>
          <input
            value={form.guest}
            onChange={(e) => set("guest", e.target.value)}
            placeholder="ex.: nome do convidado"
            className="mt-1 w-48 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft">Link de inscrição</label>
          <input
            value={form.registration_link}
            onChange={(e) => set("registration_link", e.target.value)}
            placeholder="ex.: link do WhatsApp ou formulário"
            className="mt-1 w-64 rounded border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-ink-soft">Descrição (opcional)</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "A guardar..." : "Guardar workshop"}
        </button>
        {lockSlug && (
          <a href="/admin/workshops" className="text-xs text-ink-soft underline">
            Cancelar
          </a>
        )}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
