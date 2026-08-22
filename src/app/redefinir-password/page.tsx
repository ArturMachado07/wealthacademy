"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Página para onde o link de recuperação de password (enviado por
// resetPasswordForEmail) redireciona. O cliente Supabase detecta
// automaticamente a sessão de recuperação a partir do URL (hash/código) —
// aqui só precisamos de esperar por isso e depois pedir a nova password.
export default function RedefinirPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
        setChecking(false);
      }
    });

    // Se não chegar nenhuma sessão em alguns segundos, o link é inválido ou
    // já expirou.
    const timeout = setTimeout(() => setChecking(false), 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <section className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md rounded border border-ink/10 bg-white/60 p-8 text-center">
            <p className="eyebrow">Password actualizada</p>
            <h1 className="mt-2 font-display text-2xl text-ink">Tudo pronto</h1>
            <p className="mt-3 text-sm text-ink-soft">
              A sua password foi redefinida. Já pode entrar com a nova password.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/aluno/login" className="btn-primary">
                Entrar como aluno
              </Link>
              <Link href="/admin/login" className="text-sm text-ink-soft underline">
                Entrar como administrador
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (checking) {
    return (
      <section className="py-24">
        <div className="container-page">
          <p className="mx-auto max-w-md text-center text-sm text-ink-soft">A verificar o link...</p>
        </div>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md rounded border border-ink/10 bg-white/60 p-8 text-center">
            <p className="eyebrow">Link inválido</p>
            <h1 className="mt-2 font-display text-2xl text-ink">Este link expirou</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Peça um novo link de recuperação e tente novamente.
            </p>
            <Link href="/recuperar-password" className="btn-primary mt-6 inline-block">
              Pedir novo link
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
          <p className="eyebrow">Redefinir password</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Nova password</h1>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Nova password
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Confirmar password
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? "A guardar..." : "Guardar nova password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
