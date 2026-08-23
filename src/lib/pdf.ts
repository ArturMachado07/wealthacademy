// Gerador de PDF minimalista, sem nenhuma dependência externa — escreve
// directamente a sintaxe do formato PDF (v1.4), usando as fontes standard
// Helvetica/Helvetica-Bold/Times-Roman/Times-Bold/Times-Italic (sempre
// disponíveis em qualquer leitor de PDF, sem precisar de embutir nada) e
// uma imagem (o logótipo, pré-processada e comprimida em logo-data.ts).
// Não é um gerador genérico: serve apenas para desenhar o layout fixo do
// certificado, permitindo um download directo (application/pdf) sem abrir
// o diálogo de impressão do browser e sem adicionar bibliotecas ao projecto.

import { generateQrMatrix, QR_QUIET_ZONE } from "./qrcode";
import { LOGO_WIDTH, LOGO_HEIGHT, LOGO_RGB_DEFLATE_BASE64, LOGO_ALPHA_DEFLATE_BASE64 } from "./logo-data";

export type PdfFont = "Helvetica" | "Helvetica-Bold" | "Times-Roman" | "Times-Bold" | "Times-Italic";
export type RGB = [number, number, number];

// Larguras por 1000 unidades de em — tabelas AFM padrão (as 14 fontes
// standard do PDF, de domínio público/livre distribuição, iguais às usadas
// por qualquer leitor de PDF) para o intervalo ASCII imprimível. Caracteres
// fora deste intervalo (acentos do português, p. ex.) usam uma largura
// média de reserva — é uma aproximação suficiente para centrar texto e
// quebrar linhas, não uma métrica exacta.
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

const TIMES_ROMAN_WIDTHS: Record<string, number> = {
  " ": 250, "!": 333, '"': 408, "#": 500, $: 500, "%": 833, "&": 778, "'": 333,
  "(": 333, ")": 333, "*": 500, "+": 564, ",": 250, "-": 333, ".": 250, "/": 278,
  "0": 500, "1": 500, "2": 500, "3": 500, "4": 500, "5": 500, "6": 500, "7": 500,
  "8": 500, "9": 500, ":": 278, ";": 278, "<": 564, "=": 564, ">": 564, "?": 444,
  "@": 921,
  A: 722, B: 667, C: 667, D: 722, E: 611, F: 556, G: 722, H: 722,
  I: 333, J: 389, K: 722, L: 611, M: 889, N: 722, O: 722, P: 556,
  Q: 722, R: 667, S: 556, T: 611, U: 722, V: 722, W: 944, X: 722,
  Y: 722, Z: 611,
  "[": 333, "\\": 278, "]": 333, "^": 469, _: 500, "`": 333,
  a: 444, b: 500, c: 444, d: 500, e: 444, f: 333, g: 500, h: 500,
  i: 278, j: 278, k: 500, l: 278, m: 778, n: 500, o: 500, p: 500,
  q: 500, r: 333, s: 389, t: 278, u: 500, v: 500, w: 722, x: 500,
  y: 500, z: 444,
  "{": 480, "|": 200, "}": 480, "~": 541,
};

const TIMES_BOLD_WIDTHS: Record<string, number> = {
  " ": 250, "!": 333, '"': 555, "#": 500, $: 500, "%": 1000, "&": 833, "'": 333,
  "(": 333, ")": 333, "*": 500, "+": 570, ",": 250, "-": 333, ".": 250, "/": 278,
  "0": 500, "1": 500, "2": 500, "3": 500, "4": 500, "5": 500, "6": 500, "7": 500,
  "8": 500, "9": 500, ":": 333, ";": 333, "<": 570, "=": 570, ">": 570, "?": 500,
  "@": 930,
  A: 722, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 778,
  I: 389, J: 500, K: 778, L: 667, M: 944, N: 722, O: 778, P: 611,
  Q: 778, R: 722, S: 556, T: 667, U: 722, V: 722, W: 1000, X: 722,
  Y: 722, Z: 667,
  "[": 333, "\\": 278, "]": 333, "^": 581, _: 500, "`": 333,
  a: 500, b: 556, c: 444, d: 556, e: 444, f: 333, g: 500, h: 556,
  i: 278, j: 333, k: 556, l: 278, m: 833, n: 556, o: 500, p: 556,
  q: 556, r: 444, s: 389, t: 333, u: 556, v: 500, w: 722, x: 500,
  y: 500, z: 444,
  "{": 394, "|": 220, "}": 394, "~": 520,
};

const TIMES_ITALIC_WIDTHS: Record<string, number> = {
  " ": 250, "!": 333, '"': 420, "#": 500, $: 500, "%": 833, "&": 778, "'": 333,
  "(": 333, ")": 333, "*": 500, "+": 675, ",": 250, "-": 333, ".": 250, "/": 278,
  "0": 500, "1": 500, "2": 500, "3": 500, "4": 500, "5": 500, "6": 500, "7": 500,
  "8": 500, "9": 500, ":": 333, ";": 333, "<": 675, "=": 675, ">": 675, "?": 500,
  "@": 920,
  A: 611, B: 611, C: 667, D: 722, E: 611, F: 611, G: 722, H: 722,
  I: 333, J: 444, K: 667, L: 556, M: 833, N: 667, O: 722, P: 611,
  Q: 722, R: 611, S: 500, T: 556, U: 722, V: 611, W: 833, X: 611,
  Y: 556, Z: 556,
  "[": 389, "\\": 278, "]": 389, "^": 422, _: 500, "`": 333,
  a: 500, b: 500, c: 444, d: 500, e: 444, f: 278, g: 500, h: 500,
  i: 278, j: 278, k: 444, l: 278, m: 722, n: 500, o: 500, p: 500,
  q: 500, r: 389, s: 389, t: 278, u: 500, v: 444, w: 667, x: 444,
  y: 444, z: 389,
  "{": 400, "|": 275, "}": 400, "~": 541,
};
const FALLBACK_WIDTH = 556;

function widthTable(font: PdfFont): Record<string, number> {
  switch (font) {
    case "Times-Roman":
      return TIMES_ROMAN_WIDTHS;
    case "Times-Bold":
      return TIMES_BOLD_WIDTHS;
    case "Times-Italic":
      return TIMES_ITALIC_WIDTHS;
    default:
      return HELVETICA_WIDTHS;
  }
}

function charWidth(ch: string, font: PdfFont): number {
  const table = widthTable(font);
  const w = table[ch] ?? FALLBACK_WIDTH;
  // A tabela do Helvetica-Bold reaproveita as larguras do Helvetica regular
  // (não temos uma tabela AFM dedicada para o negrito) — ajuste empírico de
  // +6% para compensar. Times-Bold já usa a tabela AFM real, sem ajuste.
  return font === "Helvetica-Bold" ? Math.round(w * 1.06) : w;
}

export function textWidth(text: string, font: PdfFont, size: number): number {
  let units = 0;
  for (const ch of text) units += charWidth(ch, font);
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

// Imagem pré-processada (ver src/lib/logo-data.ts): canais RGB e alpha já
// comprimidos com deflate/zlib offline, prontos a colar directamente num
// stream /FlateDecode do PDF — sem precisar de nenhuma biblioteca de
// imagem em runtime.
export type ImageAsset = {
  width: number;
  height: number;
  rgbDeflateBase64: string;
  alphaDeflateBase64?: string;
};

export const WEALTH_ACADEMY_LOGO: ImageAsset = {
  width: LOGO_WIDTH,
  height: LOGO_HEIGHT,
  rgbDeflateBase64: LOGO_RGB_DEFLATE_BASE64,
  alphaDeflateBase64: LOGO_ALPHA_DEFLATE_BASE64,
};

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
type ImageOp = { kind: "image"; x: number; y: number; w: number; h: number; asset: ImageAsset };
type DrawOp = TextOp | RectOp | LineOp | ImageOp;

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

  // Desenha uma imagem (ver ImageAsset) dentro do rectângulo (x, y, w, h) —
  // x/y é o canto inferior esquerdo, tal como rectFill/rectStroke.
  image(asset: ImageAsset, x: number, y: number, w: number, h: number) {
    this.ops.push({ kind: "image", x, y, w, h, asset });
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

// Nomes dos recursos de fonte, fixos — sempre declarados no dicionário
// /Resources da página (ver renderPdf), independentemente de serem usados
// ou não: são só descrições de 1 linha (fontes standard, sem programa de
// fonte embutido), o custo é insignificante.
const FONT_RESOURCE: Record<PdfFont, string> = {
  Helvetica: "F1",
  "Helvetica-Bold": "F2",
  "Times-Roman": "F3",
  "Times-Bold": "F4",
  "Times-Italic": "F5",
};
const FONT_OBJECT_NUMBER: Record<PdfFont, number> = {
  Helvetica: 4,
  "Helvetica-Bold": 5,
  "Times-Roman": 6,
  "Times-Bold": 7,
  "Times-Italic": 8,
};

function buildContentStream(page: PdfPage, imageResourceNames: Map<ImageAsset, string>): Buffer {
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
    } else if (op.kind === "image") {
      const name = imageResourceNames.get(op.asset);
      if (!name) continue;
      push("q\n");
      push(`${num(op.w)} 0 0 ${num(op.h)} ${num(op.x)} ${num(op.y)} cm\n`);
      push(`/${name} Do\n`);
      push("Q\n");
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
  // Recolhe as imagens únicas usadas na página (por identidade do objecto
  // ImageAsset) e atribui-lhes um nome de recurso e números de objecto PDF
  // — feito antes de construir o stream de conteúdo, porque este referencia
  // esses nomes ("/Im1 Do").
  const imageAssets: ImageAsset[] = [];
  for (const op of page.ops) {
    if (op.kind === "image" && !imageAssets.includes(op.asset)) imageAssets.push(op.asset);
  }
  const imageResourceNames = new Map<ImageAsset, string>();
  const imageObjNumbers = new Map<ImageAsset, { img: number; smask?: number }>();
  let nextObjNum = 9; // 1 Catalog, 2 Pages, 3 Page, 4-8 Fontes.
  imageAssets.forEach((asset, i) => {
    imageResourceNames.set(asset, `Im${i + 1}`);
    const img = nextObjNum++;
    const smask = asset.alphaDeflateBase64 ? nextObjNum++ : undefined;
    imageObjNumbers.set(asset, { img, smask });
  });
  const contentObjNum = nextObjNum;

  const content = buildContentStream(page, imageResourceNames);

  const fontDict = Object.entries(FONT_RESOURCE)
    .map(([font, res]) => `/${res} ${FONT_OBJECT_NUMBER[font as PdfFont]} 0 R`)
    .join(" ");
  const xobjectDict = imageAssets
    .map((asset) => `/${imageResourceNames.get(asset)} ${imageObjNumbers.get(asset)!.img} 0 R`)
    .join(" ");
  const resourcesDict = `/Resources << /Font << ${fontDict} >>${
    xobjectDict ? ` /XObject << ${xobjectDict} >>` : ""
  } >>`;

  // Objectos 1-3: estrutura fixa do documento (Catalog/Pages/Page).
  const objects: Buffer[] = [];
  objects.push(Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1"));
  objects.push(Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "latin1"));
  objects.push(
    Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(page.width)} ${num(page.height)}] ${resourcesDict} /Contents ${contentObjNum} 0 R >>`,
      "latin1"
    )
  );

  // Objectos 4-8: as 5 fontes standard (sem programa de fonte embutido).
  const fontBaseNames: Record<PdfFont, string> = {
    Helvetica: "Helvetica",
    "Helvetica-Bold": "Helvetica-Bold",
    "Times-Roman": "Times-Roman",
    "Times-Bold": "Times-Bold",
    "Times-Italic": "Times-Italic",
  };
  (["Helvetica", "Helvetica-Bold", "Times-Roman", "Times-Bold", "Times-Italic"] as PdfFont[]).forEach((font) => {
    objects.push(
      Buffer.from(
        `<< /Type /Font /Subtype /Type1 /BaseFont /${fontBaseNames[font]} /Encoding /WinAnsiEncoding >>`,
        "latin1"
      )
    );
  });

  // Objectos das imagens (+ SMask de transparência, quando existe) — os
  // bytes já vêm comprimidos com deflate/zlib (ver logo-data.ts), por isso
  // vão directos para o stream, sem reprocessar nada em runtime.
  for (const asset of imageAssets) {
    const nums = imageObjNumbers.get(asset)!;
    const rgbBuf = Buffer.from(asset.rgbDeflateBase64, "base64");
    const imgDict = Buffer.from(
      `<< /Type /XObject /Subtype /Image /Width ${asset.width} /Height ${asset.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${rgbBuf.length}${
        nums.smask ? ` /SMask ${nums.smask} 0 R` : ""
      } >>\nstream\n`,
      "latin1"
    );
    objects.push(Buffer.concat([imgDict, rgbBuf, Buffer.from("\nendstream", "latin1")]));

    if (nums.smask && asset.alphaDeflateBase64) {
      const alphaBuf = Buffer.from(asset.alphaDeflateBase64, "base64");
      const smaskDict = Buffer.from(
        `<< /Type /XObject /Subtype /Image /Width ${asset.width} /Height ${asset.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${alphaBuf.length} >>\nstream\n`,
        "latin1"
      );
      objects.push(Buffer.concat([smaskDict, alphaBuf, Buffer.from("\nendstream", "latin1")]));
    }
  }

  // Último objecto: o stream de conteúdo da página.
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

// Cantos decorativos em "L" — o mesmo detalhe visual das pontas do
// certificado em CertificateView.tsx (absolute ... border-l border-t /
// border-b border-r), aqui como dois traços por canto.
function drawCornerAccent(page: PdfPage, x: number, y: number, size: number, corner: "tl" | "br") {
  const opts = { color: GOLD_LIGHT, lineWidth: 0.9 };
  if (corner === "tl") {
    page.line(x, y, x, y - size, opts);
    page.line(x, y, x + size, y, opts);
  } else {
    page.line(x, y, x, y + size, opts);
    page.line(x, y, x - size, y, opts);
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
  drawCornerAccent(page, 46, height - 46, 30, "tl");
  drawCornerAccent(page, width - 46, 46, 30, "br");

  // Logótipo real (imagem, não texto) — mesmo ficheiro usado no site.
  const logoH = 42;
  const logoW = (logoH * WEALTH_ACADEMY_LOGO.width) / WEALTH_ACADEMY_LOGO.height;
  let y = height - 60;
  page.image(WEALTH_ACADEMY_LOGO, centerX - logoW / 2, y - logoH, logoW, logoH);
  y -= logoH;

  y -= 20;
  page.text(centerX, y, "WEALTH ACADEMY", { size: 11, font: "Helvetica-Bold", color: GOLD_DARK, align: "center" });
  y -= 20;
  page.text(centerX, y, "CERTIFICADO DE CONCLUSÃO", { size: 10.5, font: "Helvetica-Bold", color: INK_SOFT, align: "center" });
  y -= 26;
  page.text(centerX, y, "Certificamos que", { size: 12, font: "Times-Italic", color: INK_SOFT, align: "center" });
  y -= 36;

  const nameSize = 28;
  page.text(centerX, y, data.studentName, { size: nameSize, font: "Times-Bold", color: INK, align: "center" });
  const nameWidth = textWidth(data.studentName, "Times-Bold", nameSize);
  page.line(centerX - nameWidth / 2 - 14, y - 10, centerX + nameWidth / 2 + 14, y - 10, {
    color: GOLD_LIGHT,
    lineWidth: 0.8,
  });
  y -= 44;

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
