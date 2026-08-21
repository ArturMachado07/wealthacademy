"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function CorporateForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      origin: "Para Empresas",
      name: form.get("name"),
      company: form.get("company"),
      role: form.get("role"),
      email: form.get("email"),
      phone: form.get("phone"),
      participants: form.get("participants"),
      interest: form.get("interest"),
      trainingNeed: form.get("trainingNeed"),
      preferredModality: form.get("preferredModality"),
      message: form.get("message"),
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome" name="name" required />
        <Field label="Empresa" name="company" required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Cargo" name="role" />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Telefone" name="phone" required />
        <Field label="Número de participantes" name="participants" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Área de interesse" name="interest" />
        <Field label="Modalidade preferencial" name="preferredModality" />
      </div>
      <Field label="Necessidade de formação" name="trainingNeed" />
      <label className="grid gap-2 text-sm text-ink">
        Mensagem
        <textarea
          name="message"
          rows={5}
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      <button type="submit" className="btn-primary w-fit" disabled={status === "loading"}>
        {status === "loading" ? "A enviar..." : "Solicitar Programa Personalizado"}
      </button>

      {status === "success" && (
        <p className="text-sm text-gold-dark">Pedido recebido. A nossa equipa entrará em contacto brevemente.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700">Não foi possível enviar agora. Tente novamente ou use o WhatsApp.</p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink">
      {label}
      {required && <span className="sr-only">(obrigatório)</span>}
      <input
        name={name}
        type={type}
        required={required}
        className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
