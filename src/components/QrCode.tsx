import { generateQrMatrix, QR_QUIET_ZONE } from "@/lib/qrcode";

// SVG do QR code, gerado em src/lib/qrcode.ts (sem dependências, verificado
// a decodificar correctamente). Um <rect> por módulo escuro, dentro de um
// único <svg> — leve mesmo em versões maiores.
export default function QrCode({ text, size = 64, className }: { text: string; size?: number; className?: string }) {
  const matrix = generateQrMatrix(text, "MEDIUM");
  const n = matrix.length;
  const quiet = QR_QUIET_ZONE;
  const dim = n + quiet * 2;

  let rects = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix[y][x]) rects += `<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`;
    }
  }

  const svg = `<rect x="0" y="0" width="${dim}" height="${dim}" fill="#fff"/><g fill="#352C29">${rects}</g>`;

  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code de verificação do certificado"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
