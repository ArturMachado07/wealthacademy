"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function InterestForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      origin: "Área do Aluno — lista de interesse",
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-gold-dark">
        Obrigado! Avisamos assim que a Área do Aluno estiver disponível.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        name="name"
        placeholder="Nome"
        required
        className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold sm:w-40"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="flex-1 rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
      />
      <input name="phone" placeholder="Telefone (opcional)" className="hidden" />
      <button type="submit" className="btn-primary shrink-0" disabled={status === "loading"}>
        {status === "loading" ? "A enviar..." : "Avisem-me"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-700">Não foi possível enviar agora. Tente novamente.</p>
      )}
    </form>
  );
}
