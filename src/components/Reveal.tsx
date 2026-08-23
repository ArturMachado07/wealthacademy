"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  // Tag HTML a renderizar — permite que o Reveal seja o próprio elemento
  // (ex.: um item de grid) em vez de acrescentar um <div> extra que
  // quebraria layouts de CSS grid/flex.
  as?: ElementType;
  className?: string;
  // Atraso em ms — usado para o efeito de stagger em grupos de cards.
  delay?: number;
  // Distância (px) do deslocamento vertical no fade-in + slide-up.
  y?: number;
  // Se false, o elemento pode voltar a esconder-se ao sair do ecrã
  // (por omissão só revela uma vez, como é habitual em sites premium).
  once?: boolean;
};

// Animação de "scroll reveal" leve, sem dependências externas — usa a
// Intersection Observer API nativa do browser. Cada instância observa o seu
// próprio elemento; quando entra no ecrã, acrescenta a classe "is-visible"
// que dispara uma transição CSS de fade-in + slide-up (ver globals.css).
// Respeita prefers-reduced-motion e degrada de forma graciosa sem JS
// (ver o <noscript> global no layout.tsx).
export default function Reveal({ children, as = "div", className = "", delay = 0, y = 24, once = true }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    ["--reveal-y" as string]: `${y}px`,
  };

  return createElement(
    as,
    { ref, className: `reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`, style },
    children
  );
}
