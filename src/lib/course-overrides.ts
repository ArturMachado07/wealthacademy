import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Course } from "@/data/courses";

// Preço ("investment") e data de cada formação podem ser actualizados pelo
// Admin sem deploy (tabela course_pricing, ver
// supabase/009_course_pricing.sql). Os restantes campos do curso continuam
// a vir de src/data/courses.ts. Se não existir override, ou a Supabase
// ainda não estiver configurada, os valores do ficheiro estático
// prevalecem — nunca inventamos um valor aqui.

export type CourseOverride = {
  investment: string | null;
  date: string | null;
};

export async function getCourseOverrides(): Promise<Map<string, CourseOverride>> {
  const map = new Map<string, CourseOverride>();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return map;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("course_pricing").select("course_slug, investment, date");
    for (const row of data ?? []) {
      map.set(row.course_slug, { investment: row.investment, date: row.date });
    }
  } catch (err) {
    console.error("[course-overrides] falha ao ler preços/datas:", err);
  }

  return map;
}

export function applyCourseOverride(course: Course, override?: CourseOverride | null): Course {
  if (!override) return course;
  return {
    ...course,
    investment: override.investment || course.investment,
    date: override.date || course.date,
  };
}
