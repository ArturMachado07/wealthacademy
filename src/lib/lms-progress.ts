import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createAdminNotification } from "@/lib/notifications";

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
    .select("id, status, progress_percent, course_title")
    .eq("student_id", studentId)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (enrollment && enrollment.status !== "Concluída") {
    await supabase
      .from("enrollments")
      .update({ progress_percent: progressPercent, updated_at: new Date().toISOString() })
      .eq("id", enrollment.id);

    // Alerta o Admin só na transição para 100% (não a cada aula revisitada
    // depois disso) — é o sinal de que o aluno terminou e está à espera do
    // certificado a ser tratado manualmente.
    if (progressPercent === 100 && enrollment.progress_percent !== 100) {
      const { data: student } = await supabase.from("students").select("name").eq("id", studentId).maybeSingle();
      await createAdminNotification(supabase, {
        title: "Aluno terminou o curso",
        message: `${student?.name ?? "Um aluno"} concluiu todas as aulas de "${enrollment.course_title}" — falta marcar como concluída e anexar o certificado.`,
        link: "/admin",
      });
    }
  }

  return { progressPercent, completedLessons, totalLessons };
}
