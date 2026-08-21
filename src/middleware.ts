import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "wa_staging_access";

// Gate temporário de staging: exige login antes de ver o site na preview da
// Vercel. Não é o sistema de autenticação de alunos/admin (esse fica para
// uma fase futura) — é apenas para a direcção validar o projecto em privado.
// Alternativa nativa: Vercel Deployment Protection (Project Settings > Deployment Protection).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/staging-login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg";

  if (isPublicPath) return NextResponse.next();

  // Se não houver password definida, o gate fica desactivado (ex.: ambiente local).
  if (!process.env.STAGING_PASSWORD) return NextResponse.next();

  const hasAccess = request.cookies.get(COOKIE_NAME)?.value === "granted";
  if (hasAccess) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
