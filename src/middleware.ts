import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const COOKIE_NAME = "wa_staging_access";

// Gate temporário de staging: exige login antes de ver o site na preview da
// Vercel. Não é o sistema de autenticação de alunos/admin — é apenas para a
// direcção validar o projecto em privado.
// Alternativa nativa: Vercel Deployment Protection (Project Settings > Deployment Protection).
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/staging-login") ||
    pathname.startsWith("/api/payments/webhook") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg";

  if (!isPublicPath && process.env.STAGING_PASSWORD) {
    const hasAccess = request.cookies.get(COOKIE_NAME)?.value === "granted";
    if (!hasAccess) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Mantém a sessão Supabase (alunos) actualizada em cada pedido.
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
