"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Login da equipa (Admin/CRM). Sem registo público — contas são criadas
// manualmente (ver supabase/005_admin.sql).
export default function AdminLoginPage() {
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

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm rounded border border-cream/10 bg-ink/60 p-10 text-cream">
        <p className="text-center text-xs uppercase tracking-wide text-gold">Wealth Academy</p>
        <h1 className="mt-2 text-center text-2xl font-medium">Painel Admin</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded border border-cream/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded border border-cream/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
