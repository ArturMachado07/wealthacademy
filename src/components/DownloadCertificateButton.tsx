// Link directo para a rota que gera o PDF do certificado (application/pdf,
// Content-Disposition: attachment) — descarrega logo, sem abrir o diálogo
// de impressão do browser.
export default function DownloadCertificateButton({ href }: { href: string }) {
  return (
    <a href={href} download className="btn-secondary print:hidden">
      Descarregar PDF
    </a>
  );
}
