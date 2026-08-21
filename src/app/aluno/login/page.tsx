"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AlunoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    setLoading(false);

    if (signInError) {
      setError("Email ou password incorrectos.");
      return;
    }

    router.push("/aluno");
    router.refresh();
  }

  return (
    <section className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <p className="eyebrow">Área do Aluno</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Entrar</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Aceda à sua conta para continuar as suas formações.
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
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Password
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            Ainda não tem conta?{" "}
            <Link href="/aluno/registo" className="text-gold-dark underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
