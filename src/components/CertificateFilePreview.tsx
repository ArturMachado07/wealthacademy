type Props = {
  previewUrl: string | null;
  downloadHref: string;
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  issueDate: string;
};

// Mostra o documento real anexado pelo Admin — a digitalização do
// certificado impresso e assinado fisicamente pelo INEFOP — em vez de uma
// recriação do certificado feita pelo site. Sem moldura/cartão à volta: só
// o certificado.
//
// previewUrl é sempre uma imagem: se o Admin anexou directamente um PNG/JPG,
// é o próprio ficheiro; se anexou um PDF, é a 1ª página renderizada em PNG
// no momento do upload (ver src/lib/pdf-preview.ts) — nunca um PDF
// embutido, para evitar a "janela" do visualizador de PDF do browser. Pode
// ser null se a pré-visualização ainda não existir (upload muito antigo,
// ou a geração falhou) — nesse caso mostra-se um botão simples.
//
// Clicar (na imagem ou no botão "Descarregar certificado") descarrega
// sempre o ficheiro original — downloadHref aponta para uma rota que gera
// um link assinado com Content-Disposition: attachment (ver
// [numero]/ficheiro/route.ts), por isso funciona mesmo sem o atributo HTML
// "download" (que o browser ignora em links de outra origem).
export default function CertificateFilePreview({
  previewUrl,
  downloadHref,
  studentName,
  courseTitle,
  certificateNumber,
  issueDate,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {previewUrl ? (
        <a href={downloadHref} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element -- link assinado, temporário, não passa por next/image */}
          <img
            src={previewUrl}
            alt={`Certificado de ${studentName} — ${courseTitle}`}
            className="mx-auto w-full"
          />
        </a>
      ) : (
        <a
          href={downloadHref}
          className="flex flex-col items-center gap-3 rounded bg-ink/[0.03] py-16 text-center transition-colors hover:bg-ink/[0.06]"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gold-dark">
            <path
              d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-sm font-medium text-ink">Certificado — {courseTitle}</p>
          <p className="text-xs text-ink-soft underline">Clique para descarregar</p>
        </a>
      )}
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
