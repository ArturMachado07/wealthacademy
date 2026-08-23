import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import AddWorkshopForm from "@/components/admin/AddWorkshopForm";
import DeleteWorkshopButton from "@/components/admin/DeleteWorkshopButton";
import WorkshopFlyerUpload from "@/components/admin/WorkshopFlyerUpload";

export const metadata: Metadata = { title: "Workshops — Admin" };
export const dynamic = "force-dynamic";

type WorkshopRow = {
  slug: string;
  title: string;
  category: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  guest: string | null;
  status: string;
  description: string | null;
  registration_link: string | null;
  flyer_url: string | null;
};

export default async function AdminWorkshopsPage({
  searchParams,
}: {
  searchParams: Promise<{ editWorkshop?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { editWorkshop } = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("*")
    .order("created_at", { ascending: false });

  const workshopRows = (workshops ?? []) as WorkshopRow[];

  return (
    <section className="py-16">
      <div className="container-page">
        <Link href="/admin" className="text-sm text-ink-soft underline">
          ← Painel Admin
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Recursos</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Workshops</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Publique flyers de workshops directamente do seu dispositivo — sem precisar de deploy. Grave primeiro os
            dados, depois carregue o flyer.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium text-ink">Workshops ({workshopRows.length})</h2>
          {workshopRows.length > 0 && (
            <div className="mt-4 divide-y divide-ink/10 rounded border border-ink/10 bg-white/60">
              {workshopRows.map((workshop) => (
                <div key={workshop.slug} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    {workshop.flyer_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={workshop.flyer_url} alt="" className="h-14 w-11 rounded object-cover" />
                    ) : (
                      <div className="flex h-14 w-11 items-center justify-center rounded border border-ink/10 bg-ink/5 text-[9px] text-ink-soft">
                        Sem flyer
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-ink">{workshop.title}</p>
                      <p className="text-xs text-ink-soft">
                        Slug: {workshop.slug} · {workshop.status}
                        {workshop.date ? ` · ${workshop.date}` : ""}
                        {workshop.time ? ` · ${workshop.time}` : ""}
                        {workshop.guest ? ` · Convidado: ${workshop.guest}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <a
                      href={`/admin/workshops?editWorkshop=${workshop.slug}#workshop-form`}
                      className="text-xs text-gold-dark underline"
                    >
                      Editar
                    </a>
                    <DeleteWorkshopButton slug={workshop.slug} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div id="workshop-form" className="mt-4 space-y-4">
            {editWorkshop ? (
              (() => {
                const target = workshopRows.find((w) => w.slug === editWorkshop);
                if (!target) {
                  return <p className="text-sm text-red-700">Workshop não encontrado.</p>;
                }
                return (
                  <>
                    <AddWorkshopForm
                      lockSlug
                      initial={{
                        slug: target.slug,
                        title: target.title,
                        category: target.category ?? "",
                        date: target.date ?? "",
                        time: target.time ?? "",
                        location: target.location ?? "",
                        guest: target.guest ?? "",
                        status: target.status,
                        description: target.description ?? "",
                        registration_link: target.registration_link ?? "",
                      }}
                    />
                    <WorkshopFlyerUpload slug={target.slug} initialFlyerUrl={target.flyer_url} />
                  </>
                );
              })()
            ) : (
              <AddWorkshopForm />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
