import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import AddInstructorForm from "@/components/admin/AddInstructorForm";
import DeleteInstructorButton from "@/components/admin/DeleteInstructorButton";
import { findPublicImage } from "@/lib/media";

export const metadata: Metadata = { title: "Formadores — Admin" };
export const dynamic = "force-dynamic";

type InstructorRow = { slug: string; name: string; role: string | null; photo: string | null; bio: string | null };

export default async function AdminFormadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ editInstructor?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { editInstructor } = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data: instructors } = await supabase
    .from("instructors")
    .select("slug, name, role, photo, bio")
    .order("name");

  const instructorRows = (instructors ?? []) as InstructorRow[];

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin" className="text-sm text-ink-soft underline">
          ← Painel Admin
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Formações</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Formadores</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Directório global de formadores — depois ligue cada um às formações que lecciona em cada página de
            formação no Admin.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium text-ink">Formadores ({instructorRows.length})</h2>
          {instructorRows.length > 0 && (
            <div className="mt-4 divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
              {instructorRows.map((instructor) => {
                const imageFound = instructor.photo ? Boolean(findPublicImage(instructor.photo)) : null;
                return (
                  <div key={instructor.slug} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{instructor.name}</p>
                      <p className="text-xs text-ink-soft">
                        Slug: {instructor.slug} · {instructor.role ?? "sem cargo"}
                      </p>
                      <p className="text-xs text-ink-soft">
                        Foto:{" "}
                        {instructor.photo ? (
                          <span className={imageFound ? "text-gold-dark" : "text-red-700"}>
                            {instructor.photo} — {imageFound ? "ficheiro encontrado" : "ficheiro NÃO encontrado"}
                          </span>
                        ) : (
                          "sem foto definida"
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <a
                        href={`/admin/formadores?editInstructor=${instructor.slug}#formador-form`}
                        className="text-xs text-gold-dark underline"
                      >
                        Editar
                      </a>
                      <DeleteInstructorButton slug={instructor.slug} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div id="formador-form" className="mt-4">
            {editInstructor ? (
              (() => {
                const target = instructorRows.find((i) => i.slug === editInstructor);
                if (!target) {
                  return <p className="text-sm text-red-700">Formador não encontrado.</p>;
                }
                return (
                  <AddInstructorForm
                    lockSlug
                    initial={{
                      slug: target.slug,
                      name: target.name,
                      role: target.role ?? "",
                      bio: target.bio ?? "",
                      photo: target.photo ?? "",
                    }}
                  />
                );
              })()
            ) : (
              <AddInstructorForm />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
