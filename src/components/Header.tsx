"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/site";
import { ChevronDownIcon } from "@/components/icons";

// Workshops e Para Empresas ficam agrupados num dropdown "Recursos" no
// menu principal — liberta espaço horizontal para o logótipo (que, com
// todos os itens soltos, ficava pequeno demais no ecrã).
const RECURSOS_HREFS = ["/workshops", "/empresas"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // "Área do Aluno" fica fora do menu principal (ainda em preparação) e
  // ganha um tratamento visual distinto, junto ao CTA.
  const primaryNav = navigation.filter(
    (item) => item.href !== "/area-do-aluno" && !RECURSOS_HREFS.includes(item.href)
  );
  const recursosItems = navigation.filter((item) => RECURSOS_HREFS.includes(item.href));
  const formacoesIndex = primaryNav.findIndex((item) => item.href === "/formacoes");
  const beforeRecursos = primaryNav.slice(0, formacoesIndex + 1);
  const afterRecursos = primaryNav.slice(formacoesIndex + 1);
  const recursosActive = RECURSOS_HREFS.includes(pathname ?? "");

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/95 backdrop-blur print:hidden">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          {/* SVG servido directamente (sem next/image) — evita problemas de
              optimização/cache do Next para este ficheiro vectorial. */}
          <img
            src="/brand/logo-fundo-claro.svg"
            alt="Wealth Academy"
            width={122}
            height={86}
            className="h-12 w-auto md:h-16 lg:h-[4.375rem]"
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <nav className="flex items-center gap-6">
            {beforeRecursos.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                    active ? "text-gold" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Dropdown "Recursos" (Workshops + Para Empresas) — aberto ao
                passar o rato (CSS puro, via group-hover) e também navegável
                por teclado (o botão é focável e os links ficam sempre no
                DOM). */}
            <div className="group relative">
              <button
                type="button"
                className={`flex items-center gap-1 whitespace-nowrap text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                  recursosActive ? "text-gold" : "text-ink"
                }`}
              >
                Recursos
                <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-10 w-44 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="overflow-hidden rounded border border-ink/10 bg-white shadow-lg">
                  {recursosItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-cream hover:text-gold ${
                          active ? "text-gold" : "text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {afterRecursos.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                    active ? "text-gold" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/area-do-aluno"
              className="whitespace-nowrap text-sm font-medium text-ink-soft transition-colors hover:text-gold"
            >
              Área do Aluno
            </Link>
            <Link href="/formacoes" className="btn-primary whitespace-nowrap">
              Explorar Formações
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink/10 bg-cream lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-3 text-base font-medium text-ink hover:bg-ink/5"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/formacoes" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
              Explorar Formações
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
