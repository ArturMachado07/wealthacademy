import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Actualiza os dados da própria empresa autenticada. Usa o cliente com RLS
// (não a service role) — a segurança vem da policy "Empresa actualiza o
// próprio registo" (supabase/028_empresa_perfil.sql), que só permite update
// onde auth.uid() = auth_user_id. Mesmo padrão de /api/aluno/perfil.
export async function POST(request: Request) {
  const company = await getCurrentCompany();
  if (!company) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const nif = body?.nif?.trim() || null;
  const phone = body?.phone?.trim() || null;

  if (!name) {
    return NextResponse.json({ ok: false, error: "O nome da empresa é obrigatório." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("companies")
    .update({ name, nif, contact_phone: phone })
    .eq("id", company.id);

  if (error) {
    console.error("[empresas/perfil] falha ao actualizar perfil:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar as alterações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
