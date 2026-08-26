"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Regista uma EMPRESA — mesmo mecanismo do registo do aluno (Supabase Auth
// signUp), mas com account_type: "company" no metadata. É esse campo que o
// trigger handle_new_auth_user (ver supabase/026_companies_turmas.sql) usa
// para criar a linha em `companies` em vez de `students`.
function EmpresaRegistoForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const loginHref = from ? `/empresas/login?from=${encodeURIComponent(from)}` : "/empresas/login";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createSupabaseBrowserClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, account_type: "company" } },
    });

    setLoading(false);

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("Já existe uma conta com este email.");
      } else if (msg.includes("rate limit") || msg.includes("too many")) {
        setError(
          "Limite de emails atingido temporariamente (Supabase em modo de testes). Aguarde alguns minutos e tente novamente."
        );
      } else {
        setError(`Não foi possível criar a conta: ${signUpError.message}`);
      }
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <section className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md rounded border border-ink/10 bg-white/60 p-8 text-center">
            <p className="eyebrow">Conta criada</p>
            <h1 className="mt-2 font-display text-2xl text-ink">Verifique o seu email</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Enviámos um link de confirmação para o email indicado. Depois de
              confirmar, já pode entrar no Portal da Empresa.
            </p>
            <Link href={loginHref} className="btn-primary mt-6 inline-block">
              Ir para o login
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
          <p className="eyebrow">Para Empresas</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Criar conta da empresa</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Crie a conta da sua empresa para convidar colaboradores e acompanhar as suas turmas.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Nome da empresa
              <input
                name="name"
                required
                autoComplete="organization"
                className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
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
                minLength={6}
                autoComplete="new-password"
                className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? "A criar conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            Já tem conta?{" "}
            <Link href={loginHref} className="text-gold-dark underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function EmpresaRegistoPage() {
  return (
    <Suspense fallback={null}>
      <EmpresaRegistoForm />
    </Suspense>
  );
}
