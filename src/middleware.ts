import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

// O gate de staging (password da direcção antes de ver o site) foi
// removido — o site fica agora público a partir da homepage, sem login
// prévio. A página /login e /api/staging-login ficaram no repositório sem
// uso (não fazem mal aí), caso seja preciso reactivar este gate no futuro:
// bastaria repor o bloco de verificação de STAGING_PASSWORD aqui.
export async function middleware(request: NextRequest) {
  // Mantém a sessão Supabase (alunos/admin) actualizada em cada pedido.
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
