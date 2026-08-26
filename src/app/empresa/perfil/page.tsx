import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/company-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoUploadForm from "@/components/empresa/LogoUploadForm";
import CompanyProfileForm from "@/components/empresa/CompanyProfileForm";
import PasswordChangeForm from "@/components/aluno/PasswordChangeForm";

export const metadata: Metadata = { title: "Perfil da Empresa" };
export const dynamic = "force-dynamic";

export default async function EmpresaPerfilPage() {
  const company = await getCurrentCompany();
  if (!company) {
    redirect("/empresas/login?from=/empresa/perfil");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("companies")
    .select("name, nif, contact_email, contact_phone, logo_url")
    .eq("id", company.id)
    .single();

  return (
    <section className="py-24">
      <div className="container-page">
        <Link href="/empresa" className="text-sm text-ink-soft underline">
          ← Voltar ao Portal da Empresa
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Portal da Empresa</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Perfil da empresa</h1>
        </div>

        <div className="mt-6">
          <LogoUploadForm name={data?.name ?? company.name} initialLogoUrl={data?.logo_url ?? null} />
        </div>

        <p className="mt-6 max-w-md text-sm text-ink-soft">
          Email de acesso: <span className="text-ink">{data?.contact_email}</span>
          <br />
          <span className="text-xs text-ink-soft/70">
            Para alterar o email de acesso, contacte a Wealth Academy.
          </span>
        </p>

        <CompanyProfileForm
          initialName={data?.name ?? ""}
          initialNif={data?.nif ?? ""}
          initialPhone={data?.contact_phone ?? ""}
        />

        <div className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="text-lg font-medium text-ink">Alterar password</h2>
          <PasswordChangeForm endpoint="/api/empresas/perfil/senha" />
        </div>
      </div>
    </section>
  );
}
