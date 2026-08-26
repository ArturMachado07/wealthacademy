// Extrai o valor numérico de um preço em texto (ex.: "75.000 Kz" -> 75000).
// Mesma lógica usada em /api/payments/charge, replicada aqui para as
// turmas de empresa não dependerem daquele módulo.
export function parseInvestment(investment?: string | null): number | null {
  if (!investment) return null;
  const digits = investment.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

export function formatKz(value: number): string {
  return `${Math.round(value).toLocaleString("pt-PT")} Kz`;
}

// Preço total de uma turma: preço individual × nº de membros, com 5% de
// desconto só quando fecha completa (6/6) — turma incompleta paga o preço
// cheio, sem desconto.
export function turmaTotal(unitPrice: number, memberCount: number, discountApplied: boolean): number {
  const total = unitPrice * memberCount;
  return discountApplied ? total * 0.95 : total;
}
