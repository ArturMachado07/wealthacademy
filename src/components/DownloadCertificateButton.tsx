"use client";

// Usa a impressão do próprio browser — o utilizador escolhe "Guardar como
// PDF" no diálogo de impressão. Sem dependências novas. header/footer/chat
// ficam escondidos ao imprimir (print:hidden nesses componentes).
export default function DownloadCertificateButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary print:hidden">
      Descarregar PDF
    </button>
  );
}
