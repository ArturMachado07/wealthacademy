// Gerador de PDF minimalista, sem nenhuma dependência externa — escreve
// directamente a sintaxe do formato PDF (v1.4), usando só as fontes
// standard Helvetica/Helvetica-Bold (sempre disponíveis em qualquer leitor
// de PDF, sem precisar de embutir nada). Não é um gerador genérico: serve
// apenas para desenhar o layout fixo do certificado, permitindo um
// download directo (application/pdf) sem abrir o diálogo de impressão do
// browser e sem adicionar bibliotecas ao projecto.

import { generateQrMatrix, QR_QUIET_ZONE } from "./qrcode";

export type PdfFont = "Helvetica" | "Helvetica-Bold";
export type RGB = [number, number, number];

// Larguras por 1000 unidades de em — tabela padrão AFM da Helvetica para o
// intervalo ASCII imprimível. Caracteres fora deste intervalo (acentos do
// português, p. ex.) usam uma largura média de reserva — é uma aproximação
// suficiente para centrar texto e quebrar linhas, não uma métrica exacta.
const HELVETICA_WIDTHS: Record<string, number> = {
  " ": 278, "!": 278, '"': 355, "#": 556, $: 556, "%": 889, "&": 667, "'": 191,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556,
  "8": 556, "9": 556, ":": 278, ";": 278, "<": 584, "=": 584, ">": 584, "?": 556,
  "@": 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667,
  Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667,
  Y: 667, Z: 611,
  "[": 278, "\\": 278, "]": 278, "^": 469, _: 556, "`": 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556,
  i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556,
  q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500,
  y: 500, z: 500,
  "{": 334, "|": 260, "}": 334, "~": 584,
};
const FALLBACK_WIDTH = 556;

function charWidth(ch: string, bold: boolean): number {
  const w = HELVETICA_WIDTHS[ch] ?? FALLBACK_WIDTH;
  return bold ? Math.round(w * 1.06) : w;
}

export function textWidth(text: string, font: PdfFont, size: number): number {
  const bold = font === "Helvetica-Bold";
  let units = 0;
  for (const ch of text) units += charWidth(ch, bold);
  return (units / 1000) * size;
}

export function wrapText(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && textWidth(candidate, font, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

type TextOp = { kind: "text"; x: number; y: number; text: string; size: number; font: PdfFont; color: RGB };
type RectOp = {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  color: RGB;
  lineWidth: number;
  fill: boolean;
};
type LineOp = { kind: "line"; x1: number; y1: number; x2: number; y2: number; color: RGB; lineWidth: number };
type DrawOp = TextOp | RectOp | LineOp;

export class PdfPage {
  ops: DrawOp[] = [];
  constructor(
    public width: number,
    public height: number
  ) {}

  text(
    x: number,
    y: number,
    text: string,
    opts: { size: number; font?: PdfFont; color?: RGB; align?: "left" | "center" | "right" }
  ) {
    const font = opts.font ?? "Helvetica";
    let drawX = x;
    if (opts.align === "center") drawX = x - textWidth(text, font, opts.size) / 2;
    else if (opts.align === "right") drawX = x - textWidth(text, font, opts.size);
    this.ops.push({ kind: "text", x: drawX, y, text, size: opts.size, font, color: opts.color ?? [0.208, 0.173, 0.161] });
  }

  rectStroke(x: number, y: number, w: number, h: number, opts: { color?: RGB; lineWidth?: number } = {}) {
    this.ops.push({
      kind: "rect",
      x,
      y,
      w,
      h,
      color: opts.color ?? [0, 0, 0],
      lineWidth: opts.lineWidth ?? 1,
      fill: false,
    });
  }

  rectFill(x: number, y: number, w: number, h: number, opts: { color?: RGB } = {}) {
    this.ops.push({ kind: "rect", x, y, w, h, color: opts.color ?? [0, 0, 0], lineWidth: 0, fill: true });
  }

  line(x1: number, y1: number, x2: number, y2: number, opts: { color?: RGB; lineWidth?: number } = {}) {
    this.ops.push({ kind: "line", x1, y1, x2, y2, color: opts.color ?? [0, 0, 0], lineWidth: opts.lineWidth ?? 1 });
  }
}

function escapeLatin1(text: string): Buffer {
  const safe = Array.from(text)
    .map((ch) => (ch.codePointAt(0)! <= 0xff ? ch : "?"))
    .join("")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
  return Buffer.from(safe, "latin1");
}

function num(n: number): string {
  return (Math.round(n * 1000) / 1000).toString();
}

const FONT_RESOURCE: Record<PdfFont, string> = { Helvetica: "F1", "Helvetica-Bold": "F2" };

function buildContentStream(page: PdfPage): Buffer {
  const chunks: Buffer[] = [];
  const push = (s: string) => chunks.push(Buffer.from(s, "latin1"));

  for (const op of page.ops) {
    if (op.kind === "rect") {
      if (op.fill) {
        push(`${num(op.color[0])} ${num(op.color[1])} ${num(op.color[2])} rg\n`);
        push(`${num(op.x)} ${num(op.y)} ${num(op.w)} ${num(op.h)} re f\n`);
      } else {
        push(`${num(op.color[0])} ${num(op.color[1])} ${num(op.color[2])} RG\n`);
        push(`${num(op.lineWidth)} w\n`);
        push(`${num(op.x)} ${num(op.y)} ${num(op.w)} ${num(op.h)} re S\n`);
      }
    } else if (op.kind === "line") {
      push(`${num(op.color[0])} ${num(op.color[1])} ${num(op.color[2])} RG\n`);
      push(`${num(op.lineWidth)} w\n`);
      push(`${num(op.x1)} ${num(op.y1)} m ${num(op.x2)} ${num(op.y2)} l S\n`);
    } else {
      push("BT\n");
      push(`/${FONT_RESOURCE[op.font]} ${num(op.size)} Tf\n`);
      push(`${num(op.color[0])} ${num(op.color[1])} ${num(op.color[2])} rg\n`);
      push(`1 0 0 1 ${num(op.x)} ${num(op.y)} Tm\n`);
      chunks.push(Buffer.from("(", "latin1"));
      chunks.push(escapeLatin1(op.text));
      chunks.push(Buffer.from(") Tj\n", "latin1"));
      push("ET\n");
    }
  }
  return Buffer.concat(chunks);
}

export function renderPdf(page: PdfPage): Buffer {
  const content = buildContentStream(page);

  // 1 Catalog, 2 Pages, 3 Page, 4 Font Helvetica, 5 Font Helvetica-Bold, 6 Contents.
  const objects: Buffer[] = [];
  objects.push(Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1"));
  objects.push(Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "latin1"));
  objects.push(
    Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(page.width)} ${num(page.height)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
      "latin1"
    )
  );
  objects.push(Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>", "latin1"));
  objects.push(
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>", "latin1")
  );

  const streamHeader = Buffer.from(`<< /Length ${content.length} >>\nstream\n`, "latin1");
  const streamFooter = Buffer.from("\nendstream", "latin1");
  objects.push(Buffer.concat([streamHeader, content, streamFooter]));

  const header = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1");
  const parts: Buffer[] = [header];
  const offsets: number[] = [];
  let position = header.length;

  objects.forEach((obj, i) => {
    offsets.push(position);
    const objBuf = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, "latin1"), obj, Buffer.from("\nendobj\n", "latin1")]);
    parts.push(objBuf);
    position += objBuf.length;
  });

  const xrefStart = position;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  for (const offset of offsets) {
    xrefLines.push(`${offset.toString().padStart(10, "0")} 00000 n `);
  }
  const xref = Buffer.from(xrefLines.join("\n") + "\n", "latin1");
  parts.push(xref);

  const trailer = Buffer.from(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
    "latin1"
  );
  parts.push(trailer);

  return Buffer.concat(parts);
}

// ---- Certificado Wealth Academy ------------------------------------------

const GOLD: RGB = [0.616, 0.455, 0.227];
const GOLD_LIGHT: RGB = [0.78, 0.604, 0.365];
const GOLD_DARK: RGB = [0.478, 0.353, 0.173];
const INK: RGB = [0.208, 0.173, 0.161];
const INK_SOFT: RGB = [0.341, 0.286, 0.247];
const WHITE: RGB = [1, 1, 1];

// Desenha o QR code (gerado em src/lib/qrcode.ts, sem dependências) como
// uma grelha de rectângulos preenchidos. A matriz não inclui a "quiet
// zone" (margem em branco obrigatória à volta do QR) — é adicionada aqui,
// tal como em QrCode.tsx. Nota sobre eixos: a matriz tem a linha 0 no
// topo visual do QR, mas no PDF o eixo Y cresce para cima — por isso a
// linha 0 corresponde à maior coordenada Y do quadrado desenhado.
function drawQrCode(page: PdfPage, text: string, x: number, y: number, size: number) {
  const matrix = generateQrMatrix(text, "MEDIUM");
  const n = matrix.length;
  const quiet = QR_QUIET_ZONE;
  const dim = n + quiet * 2;
  const moduleSize = size / dim;

  page.rectFill(x, y, size, size, { color: WHITE });
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!matrix[row][col]) continue;
      const px = x + (quiet + col) * moduleSize;
      const py = y + size - (quiet + row + 1) * moduleSize;
      page.rectFill(px, py, moduleSize, moduleSize, { color: INK });
    }
  }
}

export function buildCertificatePdfBuffer(data: {
  studentName: string;
  courseTitle: string;
  hours?: string | null;
  issueDate: string;
  certificateNumber: string;
  validateUrl: string;
  // URL completa (com https://) que o QR code codifica — quem digitaliza
  // abre directamente o PDF do certificado.
  pdfUrl: string;
}): Buffer {
  const width = 842;
  const height = 595;
  const page = new PdfPage(width, height);
  const centerX = width / 2;

  page.rectStroke(28, 28, width - 56, height - 56, { color: GOLD, lineWidth: 1.4 });
  page.rectStroke(38, 38, width - 76, height - 76, { color: GOLD_LIGHT, lineWidth: 0.6 });

  let y = height - 96;
  page.text(centerX, y, "WEALTH ACADEMY", { size: 16, font: "Helvetica-Bold", color: GOLD_DARK, align: "center" });
  y -= 26;
  page.text(centerX, y, "CERTIFICADO DE CONCLUSÃO", { size: 10.5, font: "Helvetica-Bold", color: INK_SOFT, align: "center" });
  y -= 30;
  page.text(centerX, y, "Certificamos que", { size: 12, color: INK_SOFT, align: "center" });
  y -= 38;

  const nameSize = 28;
  page.text(centerX, y, data.studentName, { size: nameSize, font: "Helvetica-Bold", color: INK, align: "center" });
  const nameWidth = textWidth(data.studentName, "Helvetica-Bold", nameSize);
  page.line(centerX - nameWidth / 2 - 14, y - 10, centerX + nameWidth / 2 + 14, y - 10, {
    color: GOLD_LIGHT,
    lineWidth: 0.8,
  });
  y -= 46;

  page.text(centerX, y, "concluiu com aproveitamento a formação", { size: 12, color: INK_SOFT, align: "center" });
  y -= 22;

  const courseLines = wrapText(data.courseTitle, "Helvetica-Bold", 15, width - 220);
  for (const line of courseLines) {
    page.text(centerX, y, line, { size: 15, font: "Helvetica-Bold", color: INK, align: "center" });
    y -= 20;
  }

  const tail = data.hours
    ? `promovida pela Wealth Academy, com a carga horária total de ${data.hours}.`
    : "promovida pela Wealth Academy.";
  const tailLines = wrapText(tail, "Helvetica", 11.5, width - 260);
  for (const line of tailLines) {
    page.text(centerX, y, line, { size: 11.5, color: INK_SOFT, align: "center" });
    y -= 17;
  }

  // Rodapé — posição fixa (não depende do texto acima, que é sempre curto
  // o suficiente para nunca sobrepor esta zona). QR + número/data/URL à
  // esquerda (quem digitaliza abre o PDF directamente); assinatura à
  // direita — mesmo layout de CertificateView.tsx.
  const qrSize = 56;
  const qrX = 70;
  const qrY = 82;
  drawQrCode(page, data.pdfUrl, qrX, qrY, qrSize);

  const textX = qrX + qrSize + 14;
  page.text(textX, 124, data.certificateNumber, { size: 11, font: "Helvetica-Bold", color: INK });
  page.text(textX, 110, `Emitido em ${new Date(data.issueDate).toLocaleDateString("pt-PT")}`, {
    size: 9,
    color: INK_SOFT,
  });
  page.text(textX, 96, data.validateUrl, { size: 8.5, color: INK_SOFT });

  const rightX = width - 70;
  page.line(rightX - 190, 120, rightX, 120, { color: INK_SOFT, lineWidth: 0.7 });
  page.text(rightX, 105, "Mahália Castro", { size: 11, font: "Helvetica-Bold", color: INK, align: "right" });
  page.text(rightX, 91, "Managing Director, Wealth Academy", { size: 9, color: INK_SOFT, align: "right" });

  return renderPdf(page);
}
