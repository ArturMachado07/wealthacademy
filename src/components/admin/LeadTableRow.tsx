"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  origin: string;
  status: string;
};

// Linha da tabela de leads com detalhes extra (cargo, participantes, etc. —
// só existem em leads do formulário "Para Empresas") escondidos por trás de
// uma seta discreta, em vez do link "Ver detalhes" que antes ficava dentro
// da célula "Origem" e confundia a leitura da tabela. Ao abrir, os detalhes
// aparecem numa faixa própria a toda a largura, por baixo da linha.
export default function LeadTableRow({
  lead,
  extraFields,
}: {
  lead: Lead;
  extraFields: Array<[string, string]>;
}) {
  const [open, setOpen] = useState(false);
  const hasDetails = extraFields.length > 0;

  return (
    <>
      <tr className="border-b border-ink/5">
        <td className="py-3 pr-4 font-medium text-ink">{lead.name}</td>
        <td className="py-3 pr-4 text-ink-soft">
          {lead.email}
          {lead.phone ? ` · ${lead.phone}` : ""}
        </td>
        <td className="py-3 pr-4 text-ink-soft">{lead.interest ?? "—"}</td>
        <td className="py-3 pr-4 text-ink-soft">{lead.origin}</td>
        <td className="py-3 pr-4">
          <LeadStatusSelect leadId={lead.id} status={lead.status} />
        </td>
        <td className="w-8 py-3 text-center">
          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-label={open ? "Esconder detalhes" : "Ver detalhes"}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold-dark hover:bg-gold/20"
            >
              <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
          )}
        </td>
      </tr>
      {open && hasDetails && (
        <tr className="border-b border-ink/5 bg-gold/5">
          <td colSpan={6} className="px-4 py-3">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
              {extraFields.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-medium uppercase tracking-wide text-gold-dark">{label}</dt>
                  <dd className="mt-0.5 text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
