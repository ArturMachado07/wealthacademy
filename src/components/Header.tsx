"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // "Área do Aluno" fica fora do menu principal (ainda em preparação) e
  // ganha um tratamento visual distinto, junto ao CTA.
  const primaryNav = navigation.filter((item) => item.href !== "/area-do-aluno");

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
            className="h-12 w-auto md:h-16 lg:h-[4.5rem]"
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <nav className="flex items-center gap-6">
            {primaryNav.map((item) => {
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
