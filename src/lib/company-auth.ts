import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Company = {
  id: string;
  name: string;
  nif: string | null;
  contact_email: string;
  contact_phone: string | null;
};

// Devolve a empresa autenticada (via Supabase Auth) ou null — espelha
// getCurrentStudent() em lib/auth.ts, só que aponta para `companies` em vez
// de `students`. O registo em `companies` é criado automaticamente pelo
// trigger `handle_new_auth_user` quando o signUp inclui
// options.data.account_type = "company" (ver supabase/026_companies_turmas.sql).
export async function getCurrentCompany(): Promise<Company | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, nif, contact_email, contact_phone")
    .eq("auth_user_id", user.id)
    .single();

  if (!company) return null;

  return company as Company;
}
