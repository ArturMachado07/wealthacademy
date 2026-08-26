"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinTurmaButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleJoin() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/aluno/turmas/${code}/entrar`, { method: "POST" });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível entrar na turma.");
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-ink">
        Entrou na turma. A sua inscrição fica activa assim que a empresa concluir o pagamento.{" "}
        <Link href="/aluno" className="font-medium text-gold-dark underline">
          Ir para o meu dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={handleJoin} disabled={loading} className="btn-primary">
        {loading ? "A entrar..." : "Entrar nesta turma"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
