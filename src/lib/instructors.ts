import { createSupabaseServerClient } from "@/lib/supabase/server";
import { courses } from "@/data/courses";

// Formadores (tabelas instructors/course_instructors — ver
// supabase/014_course_content_and_instructors.sql), à semelhança dos
// autores do Wealth Insights: perfil global (nome, cargo, bio, foto),
// ligado a uma ou mais formações. Editável pelo Admin sem deploy.

export type Instructor = {
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
};

export async function getInstructors(): Promise<Instructor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("instructors").select("slug, name, role, bio, photo").order("name");
  return (data ?? []) as Instructor[];
}

export async function getInstructorBySlug(slug: string): Promise<Instructor | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("instructors")
    .select("slug, name, role, bio, photo")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Instructor) ?? null;
}

// Formadores ligados a uma formação, já ordenados (posição definida pelo
// Admin ao ligar cada formador ao curso).
export async function getInstructorsByCourse(courseSlug: string): Promise<Instructor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("course_instructors")
    .select("position, instructor:instructors(slug, name, role, bio, photo)")
    .eq("course_slug", courseSlug)
    .order("position", { ascending: true });

  return ((data ?? []) as { instructor: Instructor | Instructor[] | null }[])
    .map((row) => (Array.isArray(row.instructor) ? row.instructor[0] : row.instructor))
    .filter((instructor): instructor is Instructor => Boolean(instructor));
}

// Formações (do catálogo estático) que este formador lecciona — usado na
// página pública do formador. Cruza a ligação na BD com o catálogo em
// src/data/courses.ts (as formações em si não vivem numa tabela).
export async function getCoursesByInstructor(instructorSlug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("course_instructors")
    .select("course_slug")
    .eq("instructor_slug", instructorSlug);

  const slugs = new Set((data ?? []).map((row) => row.course_slug));
  return courses.filter((course) => slugs.has(course.slug));
}
