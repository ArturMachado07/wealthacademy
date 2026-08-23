"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type InstructorOption = { slug: string; name: string; role: string | null };

export default function CourseInstructorsForm({
  courseSlug,
  allInstructors,
  linkedSlugs,
}: {
  courseSlug: string;
  allInstructors: InstructorOption[];
  linkedSlugs: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(linkedSlugs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/admin/course-instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, instructorSlugs: selected }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  if (allInstructors.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Ainda não há formadores cadastrados.{" "}
        <Link href="/admin/formadores" className="text-gold-dark underline">
          Adicionar formadores
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {allInstructors.map((instructor) => {
          const active = selected.includes(instructor.slug);
          return (
            <button
              key={instructor.slug}
              type="button"
              onClick={() => toggle(instructor.slug)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-gold bg-gold text-cream"
                  : "border-ink/20 bg-white text-ink-soft hover:border-gold"
              }`}
            >
              {instructor.name}
              {instructor.role ? ` — ${instructor.role}` : ""}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "A guardar..." : "Guardar formadores da formação"}
        </button>
        {saved && <p className="text-xs text-gold-dark">Guardado.</p>}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <p className="text-xs text-ink-soft">
        Gerir nomes, cargos, bio e foto dos formadores em{" "}
        <Link href="/admin/formadores" className="text-gold-dark underline">
          Formadores
        </Link>
        .
      </p>
    </form>
  );
}
