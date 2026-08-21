export type EnrollmentStatus = "Em curso" | "Concluída" | "Suspensa";

export type Enrollment = {
  studentId: string;
  courseSlug: string;
  courseTitle: string;
  progressPercent: number;
  nextLesson?: string;
  status: EnrollmentStatus;
};

// Sem inscrições reais ainda — depende da Área do Aluno/LMS (fase futura).
export const enrollments: Enrollment[] = [];
