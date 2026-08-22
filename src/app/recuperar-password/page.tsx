"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Pedido de recuperação de password — comum a alunos e administradores
// (ambos usam Supabase Auth). Por segurança, mostra sempre a mesma
// mensagem de sucesso, quer o email exista ou não.
export default function RecuperarPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const supabase = createSupabaseBrowserClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <section className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md rounded border border-ink/10 bg-white/60 p-8 text-center">
            <p className="eyebrow">Verifique o seu email</p>
            <h1 className="mt-2 font-display text-2xl text-ink">Link enviado</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Se existir uma conta com esse email, enviámos um link para redefinir a
              password. Pode fechar esta página.
            </p>
            <Link href="/aluno/login" className="btn-primary mt-6 inline-block">
              Voltar ao login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <p className="eyebrow">Área do Aluno / Admin</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Recuperar password</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Indique o email da sua conta. Enviamos-lhe um link para definir uma nova
            password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? "A enviar..." : "Enviar link"}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            <Link href="/aluno/login" className="text-gold-dark underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
