"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["Novo", "Contactado", "Interessado", "Inscrito", "Convertido"];

export default function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await fetch("/api/admin/lead-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status: event.target.value }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={handleChange}
      disabled={loading}
      className="rounded border border-ink/20 bg-white px-2 py-1 text-xs text-ink"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
