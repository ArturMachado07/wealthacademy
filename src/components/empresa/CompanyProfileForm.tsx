"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Formulário de dados da empresa — mesmo padrão de ProfileForm.tsx (aluno),
// com o campo NIF a mais.
export default function CompanyProfileForm({
  initialName,
  initialNif,
  initialPhone,
}: {
  initialName: string;
  initialNif: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nif, setNif] = useState(initialNif);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/empresas/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nif, phone }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar as alterações.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Nome da empresa
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        NIF
        <input
          value={nif}
          onChange={(e) => setNif(e.target.value)}
          placeholder="NIF da empresa"
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Telefone
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+244 9XX XXX XXX"
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && <p className="text-sm text-gold-dark">Alterações guardadas.</p>}

      <button type="submit" disabled={loading} className="btn-primary mt-2 self-start">
        {loading ? "A guardar..." : "Guardar alterações"}
      </button>
    </form>
  );
}
