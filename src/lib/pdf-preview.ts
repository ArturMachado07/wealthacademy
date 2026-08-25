// Renderiza a 1ª página de um PDF (o certificado digitalizado que o Admin
// anexa) numa imagem PNG, para poder ser mostrada directamente na página —
// sem isto, a única forma de "ver" um PDF no browser é através do
// visualizador nativo (com a sua própria barra/moldura, algo que já foi
// tentado e não é o que queremos aqui). Usa pdf-parse, que já traz o
// @napi-rs/canvas por baixo — binários nativos pré-compilados por
// plataforma, sem precisar de compilar nada na Vercel. Ver next.config.mjs
// (serverComponentsExternalPackages) — sem isso a build falha a tentar
// incluir esses binários dentro do bundle da função.
//
// IMPORTANTE: esta função nunca deve impedir o upload do certificado de se
// completar — o chamador tem sempre de a envolver num try/catch e tratar
// null como "sem pré-visualização, mas o ficheiro original continua
// disponível para download".
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export async function renderFirstPdfPageToPng(pdfBytes: Uint8Array): Promise<Buffer | null> {
  const parser = new PDFParse({ data: pdfBytes, CanvasFactory });
  try {
    const result = await parser.getScreenshot({ scale: 2, imageBuffer: true, imageDataUrl: false });
    const first = result.pages[0];
    if (!first) return null;
    return Buffer.from(first.data);
  } finally {
    await parser.destroy();
  }
}
