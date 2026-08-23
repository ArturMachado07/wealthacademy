import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Student = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};

// Devolve o aluno autenticado (via Supabase Auth) ou null. Antes de
// NEXT_PUBLIC_SUPABASE_URL/ANON_KEY estarem definidos, devolve sempre null
// — a Área do Aluno mantém-se no estado "em preparação" sem rebentar.
export async function getCurrentStudent(): Promise<Student | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, avatar_url")
    .eq("auth_user_id", user.id)
    .single();

  if (!student) return null;

  return student as Student;
}
