type Props = {
  fileUrl: string;
  isPdf: boolean;
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  issueDate: string;
};

// Mostra o documento real anexado pelo Admin — a digitalização do
// certificado impresso e assinado fisicamente pelo INEFOP — em vez de uma
// recriação do certificado feita pelo site. fileUrl é um link temporário
// assinado do storage privado "certificados" (ver [numero]/page.tsx).
export default function CertificateFilePreview({
  fileUrl,
  isPdf,
  studentName,
  courseTitle,
  certificateNumber,
  issueDate,
}: Props) {
  return (
    <div className="certificate-print mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded border border-ink/10 bg-white p-3 shadow-xl shadow-ink/10 sm:p-4">
        {isPdf ? (
          <iframe
            src={fileUrl}
            title={`Certificado de ${studentName}`}
            className="h-[75vh] w-full rounded border border-ink/10"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- link assinado, temporário, não passa por next/image
          <img
            src={fileUrl}
            alt={`Certificado de ${studentName} — ${courseTitle}`}
            className="mx-auto max-h-[80vh] w-auto rounded"
          />
        )}
      </div>
      <div className="mt-4 text-center print:hidden">
        <p className="text-sm font-medium text-ink">
          {studentName} — {courseTitle}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {certificateNumber} · Emitido em {new Date(issueDate).toLocaleDateString("pt-PT")}
        </p>
      </div>
    </div>
  );
}
