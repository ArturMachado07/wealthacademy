// Gera um resumo curto a partir de um texto existente (para cards de
// listagem), sem alterar nem inventar conteúdo — usa a primeira frase do
// texto original e, se ainda for longa, corta num limite de caracteres.
export function excerpt(text: string, maxLength = 140): string {
  const firstSentenceMatch = text.match(/^.*?[.!?](?=\s|$)/);
  const base = firstSentenceMatch ? firstSentenceMatch[0].trim() : text;

  if (base.length <= maxLength) return base;

  const truncated = base.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}
