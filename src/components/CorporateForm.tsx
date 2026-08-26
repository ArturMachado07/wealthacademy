"use client";

import { useState, type FormEvent } from "react";
import { trainingCategories } from "@/data/categories";

type Status = "idle" | "loading" | "success" | "error";

const PARTICIPANT_OPTIONS = ["Até 6 pessoas", "7 a 12 pessoas", "13 a 20 pessoas", "Mais de 20 pessoas"];

const MODALITY_OPTIONS = ["Presencial", "Online", "Híbrido", "Sem preferência"];

const TRAINING_NEED_OPTIONS = [
  "Formação de equipas / colaboradores",
  "Certificação profissional para a equipa",
  "Workshop ou palestra pontual",
  "Programa de formação contínua",
  "Consultoria e diagnóstico organizacional",
  "Outro",
];

export default function CorporateForm() {
  const [status, setStatus] = useState<Status>("idle");
  // Controla a transição do formulário: quando o pedido é aceite, primeiro
  // desvanecemos o formulário (visible=false) e só depois de a transição
  // terminar é que trocamos o conteúdo pelo agradecimento, para o efeito
  // ficar suave em vez de trocar de repente.
  const [visible, setVisible] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    // Guardamos a referência ao <form> antes do await — ver nota em
    // ContactForm.tsx: usar event.currentTarget depois de um await pode
    // lançar mesmo com o pedido bem-sucedido.
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
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
      formEl.reset();
      setVisible(false);
      setTimeout(() => {
        setStatus("success");
        requestAnimationFrame(() => setVisible(true));
      }, 400);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      {status === "success" ? (
        <div className="py-16 text-center">
          <p className="font-display text-2xl text-gold-dark">Obrigado!</p>
          <p className="mt-3 text-sm text-ink-soft">A nossa equipa entrará em contacto brevemente.</p>
        </div>
      ) : (
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
            <Select label="Número de participantes" name="participants" options={PARTICIPANT_OPTIONS} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="Área de interesse" name="interest" options={[...trainingCategories]} />
            <Select label="Modalidade preferencial" name="preferredModality" options={MODALITY_OPTIONS} />
          </div>
          <Select label="Necessidade de formação" name="trainingNeed" options={TRAINING_NEED_OPTIONS} />
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

          {status === "error" && (
            <p className="text-sm text-red-700">Não foi possível enviar agora. Tente novamente ou use o WhatsApp.</p>
          )}
        </form>
      )}
    </div>
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

function Select({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink">
      {label}
      {required && <span className="sr-only">(obrigatório)</span>}
      <select
        name={name}
        required={required}
        defaultValue=""
        className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
      >
        <option value="" disabled>
          Seleccione
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
