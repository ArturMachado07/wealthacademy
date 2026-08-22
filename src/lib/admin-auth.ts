import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Director" | "Gestor de Formações" | "Gestor de Leads";
};

// Devolve o administrador autenticado (via Supabase Auth + tabela `admins`)
// ou null. Contas de admin não têm registo público — são criadas
// manualmente (ver supabase/005_admin.sql).
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, name, email, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!admin) return null;

  return admin as AdminUser;
}
