// Abre o compositor de partilha do LinkedIn com o link do certificado —
// o LinkedIn lê as tags Open Graph dessa página (título, descrição, imagem
// gerada em /api/validar/[numero]/imagem) para montar a pré-visualização.
export default function ShareLinkedInButton({ url }: { url: string }) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  return (
    <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-primary print:hidden">
      Partilhar no LinkedIn
    </a>
  );
}
