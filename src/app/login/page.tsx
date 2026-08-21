"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    const res = await fetch("/api/staging-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password"), from }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Não foi possível validar a password.");
      return;
    }

    router.push(data.redirectTo ?? "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm rounded border border-cream/10 bg-ink/60 p-10 text-cream">
        <Image
          src="/brand/logo-fundo-escuro.svg"
          alt="Wealth Academy"
          width={180}
          height={72}
          className="mx-auto h-14 w-auto"
        />
        <p className="mt-6 text-center text-sm text-cream/70">
          Pré-visualização reservada à direcção da Wealth Academy.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm">
            Password
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="rounded border border-cream/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-gold-light"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "A validar..." : "Entrar"}
          </button>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
