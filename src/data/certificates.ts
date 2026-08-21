export type Certificate = {
  studentId: string;
  studentName: string;
  courseTitle: string;
  hours: string;
  issueDate: string;
  certificateNumber: string; // formato WA-XXXX
};

// Sem certificados emitidos ainda.
export const certificates: Certificate[] = [];

export function certificateValidationUrl(certificateNumber: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wealthacademy.ao";
  return `${base}/validar/${certificateNumber}`;
}
