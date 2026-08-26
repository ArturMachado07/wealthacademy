"use client";

import { useState } from "react";

export default function InviteLinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de clipboard — o link já está visível no campo para
      // seleccionar/copiar manualmente.
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 truncate rounded border border-ink/10 bg-cream px-3 py-1.5 text-xs text-ink"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="whitespace-nowrap rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/40"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
