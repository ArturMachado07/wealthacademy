import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { insightCategories } from "@/data/categories";

// Cria/actualiza um artigo (upsert por slug). Em modo de edição, o
// formulário mantém sempre o mesmo slug — reenviar um slug diferente cria
// um novo artigo em vez de editar o existente. Só administradores.
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug?.trim();
  const title = body?.title?.trim();
  const category = body?.category;
  const excerpt = body?.excerpt?.trim();
  const authorSlug = body?.authorSlug;
  const date = body?.date?.trim();

  if (!slug || !title || !excerpt || !authorSlug || !date) {
    return NextResponse.json({ ok: false, error: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  if (!insightCategories.includes(category)) {
    return NextResponse.json({ ok: false, error: "Categoria inválida." }, { status: 400 });
  }

  const readingTime = body?.readingTime?.trim() || null;
  const photo = body?.photo?.trim() || null;
  const gallery = Array.isArray(body?.gallery) ? body.gallery.filter(Boolean) : null;
  const articleBody = Array.isArray(body?.body) ? body.body.filter(Boolean) : null;
  const source = body?.source?.trim() || null;
  const sourceUrl = body?.sourceUrl?.trim() || null;
  const published = Boolean(body?.published);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("insight_articles").upsert(
    {
      slug,
      title,
      category,
      excerpt,
      author_slug: authorSlug,
      date,
      reading_time: readingTime,
      photo,
      gallery: gallery && gallery.length > 0 ? gallery : null,
      body: articleBody && articleBody.length > 0 ? articleBody : null,
      source,
      source_url: sourceUrl,
      published,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

  if (error) {
    console.error("[admin/insights/articles] falha ao guardar artigo:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível guardar o artigo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Artigo em falta." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("insight_articles").delete().eq("slug", slug);

  if (error) {
    console.error("[admin/insights/articles] falha ao eliminar artigo:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível eliminar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
