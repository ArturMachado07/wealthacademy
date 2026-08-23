import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/aluno/ProfileForm";
import AvatarUploadForm from "@/components/aluno/AvatarUploadForm";
import PasswordChangeForm from "@/components/aluno/PasswordChangeForm";

export const metadata: Metadata = { title: "O meu perfil" };
export const dynamic = "force-dynamic";

export default async function AlunoPerfilPage() {
  const student = await getCurrentStudent();
  if (!student) {
    redirect("/aluno/login?from=/aluno/perfil");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("students")
    .select("name, email, phone, avatar_url")
    .eq("id", student.id)
    .single();

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/aluno" className="text-sm text-ink-soft underline">
          ← Voltar ao dashboard
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Área do Aluno</p>
          <h1 className="mt-2 font-display text-3xl text-ink">O meu perfil</h1>
        </div>

        <div className="mt-6">
          <AvatarUploadForm name={data?.name ?? student.name} initialAvatarUrl={data?.avatar_url ?? null} />
        </div>

        <p className="mt-6 max-w-md text-sm text-ink-soft">
          Email: <span className="text-ink">{data?.email}</span>
          <br />
          <span className="text-xs text-ink-soft/70">
            Para alterar o email de acesso, contacte a Wealth Academy.
          </span>
        </p>

        <ProfileForm initialName={data?.name ?? ""} initialPhone={data?.phone ?? ""} />

        <div className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="text-lg font-medium text-ink">Alterar password</h2>
          <PasswordChangeForm />
        </div>
      </div>
    </section>
  );
}
