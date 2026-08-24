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
  // Suprime a barra de ferramentas/painel lateral do visualizador de PDF
  // nativo do browser (Chrome/Edge) — sem isto mostra a sua própria "janela"
  // escura à volta do certificado. É só um fragmento de URL, não vai para o
  // servidor, por isso não interfere com a assinatura do link.
  const pdfSrc = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`;

  return (
    <div className="certificate-print mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded border border-ink/10 bg-white p-3 shadow-xl shadow-ink/10 sm:p-4">
        {isPdf ? (
          // Sem nenhuma interface de visualizador aqui — o iframe fica
          // "surdo" a cliques (pointer-events-none) e é só o link à volta
          // que é clicável, abrindo o PDF a sério, no visualizador nativo do
          // browser, numa nova aba. Visualmente comporta-se como uma imagem.
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-[1.414/1] w-full cursor-zoom-in overflow-hidden rounded"
          >
            <iframe
              src={pdfSrc}
              title={`Certificado de ${studentName}`}
              tabIndex={-1}
              aria-hidden="true"
              className="h-full w-full border-0 pointer-events-none select-none"
            />
          </a>
        ) : (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in">
            {/* eslint-disable-next-line @next/next/no-img-element -- link assinado, temporário, não passa por next/image */}
            <img
              src={fileUrl}
              alt={`Certificado de ${studentName} — ${courseTitle}`}
              className="mx-auto max-h-[80vh] w-auto rounded"
            />
          </a>
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
