"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  courseSlug: string;
  courseTitle: string;
};

type Status = "idle" | "loading" | "success" | "already" | "error";

export default function EnrollButton({ courseSlug, courseTitle }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    setStatus("loading");

    const res = await fetch("/api/aluno/inscrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, courseTitle }),
    });

    if (res.status === 401) {
      // Sem sessão — manda para o login e traz o aluno de volta a esta
      // formação depois de entrar.
      router.push(`/aluno/login?from=/formacoes/${courseSlug}`);
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setStatus("error");
      return;
    }

    setStatus(data.alreadyEnrolled ? "already" : "success");
  }

  if (status === "success" || status === "already") {
    return (
      <div className="rounded border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-ink">
        {status === "success"
          ? "Inscrição confirmada."
          : "Já está inscrito nesta formação."}{" "}
        <Link href="/aluno" className="font-medium text-gold-dark underline">
          Ver no meu dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:border-ink/40"
      >
        {status === "loading" ? "A inscrever..." : "Já é aluno? Inscreva-se na sua conta"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-700">
          Não foi possível concluir a inscrição. Tente novamente.
        </p>
      )}
    </div>
  );
}
