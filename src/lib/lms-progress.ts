import { createSupabaseAdminClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

// Recalcula a percentagem de progresso de uma inscrição (aulas concluídas
// vs. total de aulas do curso) e actualiza `enrollments.progress_percent`.
// Partilhado entre /api/aluno/lesson-progress (marcação manual) e
// /api/aluno/quiz-attempt (conclusão automática ao passar no teste).
export async function recalcCourseProgress(
  supabase: AdminClient,
  studentId: string,
  courseSlug: string
): Promise<{ progressPercent: number; completedLessons: number; totalLessons: number }> {
  const { data: courseModules } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_slug", courseSlug);

  const moduleIds = (courseModules ?? []).map((m) => m.id);

  let totalLessons = 0;
  let completedLessons = 0;

  if (moduleIds.length > 0) {
    const { data: allLessons } = await supabase.from("lessons").select("id").in("module_id", moduleIds);
    const lessonIds = (allLessons ?? []).map((l) => l.id);
    totalLessons = lessonIds.length;

    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId)
        .in("lesson_id", lessonIds);
      completedLessons = count ?? 0;
    }
  }

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Não mexe no estado "Concluída" — isso continua a ser uma decisão manual
  // do Admin (emite certificado), mesmo que o progresso chegue a 100%.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (enrollment && enrollment.status !== "Concluída") {
    await supabase
      .from("enrollments")
      .update({ progress_percent: progressPercent, updated_at: new Date().toISOString() })
      .eq("id", enrollment.id);
  }

  return { progressPercent, completedLessons, totalLessons };
}
