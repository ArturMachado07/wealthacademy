"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    // Guardamos a referência ao <form> antes do await: os SyntheticEvents do
    // React podem invalidar "event.currentTarget" assim que o handler cede o
    // controlo (no primeiro await). Se usássemos event.currentTarget.reset()
    // depois do fetch, isso podia lançar mesmo com o pedido bem-sucedido —
    // e o utilizador via "erro" apesar do lead ter sido guardado.
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      origin: "Contactos",
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      interest: form.get("interest"),
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
      formEl.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Telefone" name="phone" required />
        <Field label="Área de interesse" name="interest" />
      </div>
      <label className="grid gap-2 text-sm text-ink">
        Mensagem
        <textarea
          name="message"
          rows={5}
          className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      <button type="submit" className="btn-primary w-fit" disabled={status === "loading"}>
        {status === "loading" ? "A enviar..." : "Enviar mensagem"}
      </button>

      {status === "success" && (
        <p className="text-sm text-gold-dark">Mensagem enviada. Entraremos em contacto brevemente.</p>
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
