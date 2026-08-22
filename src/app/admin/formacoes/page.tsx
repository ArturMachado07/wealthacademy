import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";

export const metadata: Metadata = { title: "Conteúdo das formações — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFormacoesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const { data: modules } = await supabase.from("course_modules").select("course_slug");

  const moduleCounts = new Map<string, number>();
  for (const row of modules ?? []) {
    moduleCounts.set(row.course_slug, (moduleCounts.get(row.course_slug) ?? 0) + 1);
  }

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin" className="text-sm text-ink-soft underline">
          ← Painel Admin
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Conteúdo do LMS</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Formações</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Escolha uma formação para gerir os seus módulos e aulas.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/admin/formacoes/${course.slug}`}
              className="rounded border border-ink/10 bg-white/60 p-6 hover:border-gold/50"
            >
              <h2 className="text-lg font-medium text-ink">{course.title}</h2>
              <p className="mt-1 text-xs text-ink-soft">
                {moduleCounts.get(course.slug) ?? 0} módulo(s)
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
