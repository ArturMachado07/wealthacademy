"use client";

import { useState, type FormEvent } from "react";

export default function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/aluno/perfil/senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível alterar a password.");
      return;
    }

    setPassword("");
    setConfirm("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Nova password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Confirmar password
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && <p className="text-sm text-gold-dark">Password alterada.</p>}

      <button type="submit" disabled={loading} className="btn-primary mt-2 self-start">
        {loading ? "A alterar..." : "Alterar password"}
      </button>
    </form>
  );
}
