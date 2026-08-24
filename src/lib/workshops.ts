import { createSupabaseServerClient } from "@/lib/supabase/server";

// Workshops (tabela workshops — ver supabase/018_workshops.sql). Ao
// contrário dos formadores/autores, o flyer é carregado directamente do
// dispositivo do Admin (bucket "flyers"), não um ficheiro estático em
// public/images — para permitir publicar um novo workshop sem deploy.

export type WorkshopStatus = "Em breve" | "Inscrições abertas" | "Esgotado" | "Realizado";

export type Workshop = {
  slug: string;
  title: string;
  category: string | null;
  date: string | null;
  // Data real (ISO, ex. "2026-09-12") — separada de `date` (texto livre,
  // para exibição). Usada só para o schema.org/Event; opcional.
  event_date: string | null;
  time: string | null;
  location: string | null;
  guest: string | null;
  status: WorkshopStatus;
  description: string | null;
  registration_link: string | null;
  flyer_url: string | null;
};

export async function getWorkshops(): Promise<Workshop[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("workshops").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Workshop[];
}

// Página dedicada de cada workshop (/workshops/[slug]) — existe sobretudo
// para ter um link partilhável com o flyer como imagem de pré-visualização
// (og:image). Um link wa.me sozinho nunca mostra banner no WhatsApp: quem
// gera a pré-visualização é a página de destino, não o link em si.
export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("workshops").select("*").eq("slug", slug).maybeSingle();
  return (data as Workshop) ?? null;
}
