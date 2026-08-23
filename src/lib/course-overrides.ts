import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Course } from "@/data/courses";

// A página de cada formação é editável pelo Admin sem precisar de deploy
// (tabela course_pricing — o nome ficou do início do projecto, quando só
// guardava preço/data, mas hoje cobre o resto do conteúdo "de marketing"
// da página: título, descrição, carga horária, admissão, data, local,
// certificação, inclui e banner — ver
// supabase/014_course_content_and_instructors.sql). O programa (módulos)
// continua só em src/data/courses.ts, não é editável pelo Admin. Se não
// existir override, ou a Supabase ainda não estiver configurada, os
// valores do ficheiro estático prevalecem — nunca inventamos um valor aqui.

export type CourseOverride = {
  investment: string | null;
  date: string | null;
  title: string | null;
  description: string | null;
  duration: string | null;
  admission: string | null;
  location: string | null;
  certification: string | null;
  extras: string[] | null;
  image: string | null;
};

const OVERRIDE_COLUMNS =
  "course_slug, investment, date, title, description, duration, admission, location, certification, extras, image";

export async function getCourseOverrides(): Promise<Map<string, CourseOverride>> {
  const map = new Map<string, CourseOverride>();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return map;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("course_pricing").select(OVERRIDE_COLUMNS);
    for (const row of data ?? []) {
      map.set(row.course_slug, {
        investment: row.investment,
        date: row.date,
        title: row.title,
        description: row.description,
        duration: row.duration,
        admission: row.admission,
        location: row.location,
        certification: row.certification,
        extras: row.extras,
        image: row.image,
      });
    }
  } catch (err) {
    console.error("[course-overrides] falha ao ler conteúdo editável do curso:", err);
  }

  return map;
}

export function applyCourseOverride(course: Course, override?: CourseOverride | null): Course {
  if (!override) return course;
  return {
    ...course,
    investment: override.investment || course.investment,
    date: override.date || course.date,
    title: override.title || course.title,
    description: override.description || course.description,
    duration: override.duration || course.duration,
    admission: override.admission || course.admission,
    location: override.location || course.location,
    certification: override.certification || course.certification,
    extras: override.extras && override.extras.length > 0 ? override.extras : course.extras,
    image: override.image || course.image,
  };
}
