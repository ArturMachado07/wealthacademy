// Utilitário puro (sem "use client") para calcular o atraso de stagger de
// cada item de uma lista. Fica fora de components/Reveal.tsx de propósito:
// esse ficheiro tem "use client", e o Next.js troca TODAS as suas
// exportações por referências de cliente quando importadas por um Server
// Component — incluindo funções simples como esta, que deixam de poder ser
// chamadas directamente durante o render no servidor ("is not a function").
export function staggerDelay(index: number, step = 80, max = 480) {
  return Math.min(index * step, max);
}
