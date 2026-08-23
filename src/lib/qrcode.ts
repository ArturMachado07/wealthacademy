// Gerador de QR Code, sem nenhuma dependência externa — porte directo (TS)
// do algoritmo de referência de domínio público "QR Code generator library"
// de Project Nayuki (MIT License, https://www.nayuki.io/page/qr-code-generator-library),
// reduzido ao necessário aqui: apenas modo Byte (suficiente para uma URL),
// escolha automática da versão mínima e da máscara com melhor pontuação.
// Devolve uma matriz booleana (true = módulo escuro) para desenhar onde for
// preciso (PDF, SVG/HTML). Verificado a decodificar correctamente com
// cv2.QRCodeDetector antes de entrar em produção.

type Ecc = "LOW" | "MEDIUM" | "QUARTILE" | "HIGH";

const ECC_ORDINAL: Record<Ecc, number> = { LOW: 0, MEDIUM: 1, QUARTILE: 2, HIGH: 3 };
const ECC_FORMAT_BITS: Record<Ecc, number> = { LOW: 1, MEDIUM: 0, QUARTILE: 3, HIGH: 2 };

// [nível][versão] — versão 0 é padding (não usada).
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

type MaskFn = (x: number, y: number) => number;
const MASK_PATTERNS: MaskFn[] = [
  (x, y) => (x + y) % 2,
  (x, y) => y % 2,
  (x, y) => x % 3,
  (x, y) => (x + y) % 3,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2,
  (x, y) => ((x * y) % 2) + ((x * y) % 3),
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2,
];

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
    z &= 0xff;
  }
  return z;
}

function reedSolomonComputeDivisor(degree: number): number[] {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonComputeRemainder(data: number[], divisor: number[]): number[] {
  const result = new Array(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= reedSolomonMultiply(divisor[i], factor);
    }
  }
  return result;
}

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numalign = Math.floor(ver / 7) + 2;
    result -= (25 * numalign - 10) * numalign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(ver: number, eclOrdinal: number): number {
  return (
    Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[eclOrdinal][ver] * NUM_ERROR_CORRECTION_BLOCKS[eclOrdinal][ver]
  );
}

function charCountBits(version: number): number {
  // Modo Byte: 8 bits (v1-9), 16 bits (v10-40).
  if (version <= 9) return 8;
  return 16;
}

class BitBuffer {
  bits: number[] = [];
  appendBits(val: number, n: number) {
    for (let i = n - 1; i >= 0; i--) this.bits.push((val >>> i) & 1);
  }
  get length() {
    return this.bits.length;
  }
}

function addEccAndInterleave(data: number[], version: number, eclOrdinal: number): number[] {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[eclOrdinal][version];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[eclOrdinal][version];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const rsDiv = reedSolomonComputeDivisor(blockEccLen);
  let k = 0;
  for (let i = 0; i < numBlocks; i++) {
    const len = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + len);
    k += dat.length;
    const ecc = reedSolomonComputeRemainder(dat, rsDiv);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(blocks[j][i]);
      }
    }
  }
  return result;
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) return [];
  const numalign = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = Math.floor((version * 8 + numalign * 3 + 5) / (numalign * 4 - 4)) * 2;
  const result: number[] = [];
  for (let i = 0; i < numalign - 1; i++) result.push(size - 7 - i * step);
  result.push(6);
  return result.reverse();
}

// Zona de margem branca em módulos à volta do QR, exigida pela norma para
// leitura fiável (usada por quem consome a matriz para desenhar/renderizar).
export const QR_QUIET_ZONE = 4;

export function generateQrMatrix(text: string, minEcl: Ecc = "MEDIUM"): boolean[][] {
  const dataBytes = Array.from(new TextEncoder().encode(text));

  // Escolhe a menor versão (1..40) onde os dados cabem no nível de correcção pedido.
  let version = -1;
  let dataUsedBits = -1;
  for (let v = 1; v <= 40; v++) {
    const ccBits = charCountBits(v);
    const usedBits = 4 + ccBits + dataBytes.length * 8;
    const capacityBits = getNumDataCodewords(v, ECC_ORDINAL[minEcl]) * 8;
    if (usedBits <= capacityBits) {
      version = v;
      dataUsedBits = usedBits;
      break;
    }
  }
  if (version === -1) {
    throw new Error("Texto demasiado longo para gerar QR code.");
  }

  const eclOrdinal = ECC_ORDINAL[minEcl];
  const dataCapacityBits = getNumDataCodewords(version, eclOrdinal) * 8;

  const bb = new BitBuffer();
  bb.appendBits(0x4, 4); // modo Byte
  bb.appendBits(dataBytes.length, charCountBits(version));
  for (const byte of dataBytes) bb.appendBits(byte, 8);

  // Terminador + padding até byte + bytes de padding alternados.
  bb.appendBits(0, Math.min(4, dataCapacityBits - bb.length));
  while (bb.length % 8 !== 0) bb.bits.push(0);
  let padToggle = true;
  while (bb.length < dataCapacityBits) {
    bb.appendBits(padToggle ? 0xec : 0x11, 8);
    padToggle = !padToggle;
  }

  const dataCodewords: number[] = [];
  for (let i = 0; i < bb.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bb.bits[i + j];
    dataCodewords.push(byte);
  }

  const allCodewords = addEccAndInterleave(dataCodewords, version, eclOrdinal);

  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  function setFunctionModule(x: number, y: number, dark: boolean) {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  }

  function drawFinderPattern(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunctionModule(x, y, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  function drawAlignmentPattern(cx: number, cy: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunctionModule(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  function getBit(x: number, i: number): boolean {
    return ((x >>> i) & 1) !== 0;
  }

  function drawFormatBits(mask: number) {
    const data = (ECC_FORMAT_BITS[minEcl] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) setFunctionModule(8, i, getBit(bits, i));
    setFunctionModule(8, 7, getBit(bits, 6));
    setFunctionModule(8, 8, getBit(bits, 7));
    setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i <= 14; i++) setFunctionModule(14 - i, 8, getBit(bits, i));

    for (let i = 0; i <= 7; i++) setFunctionModule(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i <= 14; i++) setFunctionModule(8, size - 15 + i, getBit(bits, i));
    setFunctionModule(8, size - 8, true);
  }

  function drawVersion() {
    if (version < 7) return;
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunctionModule(a, b, bit);
      setFunctionModule(b, a, bit);
    }
  }

  // Padrões de temporização.
  for (let i = 0; i < size; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }
  drawFinderPattern(3, 3);
  drawFinderPattern(size - 4, 3);
  drawFinderPattern(3, size - 4);

  const alignPos = getAlignmentPatternPositions(version);
  for (let i = 0; i < alignPos.length; i++) {
    for (let j = 0; j < alignPos.length; j++) {
      const corner =
        (i === 0 && j === 0) || (i === 0 && j === alignPos.length - 1) || (i === alignPos.length - 1 && j === 0);
      if (!corner) drawAlignmentPattern(alignPos[i], alignPos[j]);
    }
  }

  drawFormatBits(0);
  drawVersion();

  // Codewords em ziguezague.
  let bitIndex = 0;
  const totalBits = allCodewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right <= 6) right -= 1;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < totalBits) {
          const byte = allCodewords[bitIndex >> 3];
          modules[y][x] = getBit(byte, 7 - (bitIndex & 7));
          bitIndex++;
        }
      }
    }
  }

  // Escolhe a máscara (0-7) com a menor pontuação de penalização.
  function applyMask(mask: number) {
    const maskFn = MASK_PATTERNS[mask];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!isFunction[y][x] && maskFn(x, y) === 0) modules[y][x] = !modules[y][x];
      }
    }
  }

  function finderPenaltyCountPatterns(history: number[]): number {
    const n = history[1];
    const core = n > 0 && history[2] === n && history[4] === n && history[5] === n && history[3] === n * 3;
    let count = 0;
    if (core && history[0] >= n * 4 && history[6] >= n) count++;
    if (core && history[6] >= n * 4 && history[0] >= n) count++;
    return count;
  }

  function finderPenaltyAddHistory(runLength: number, history: number[]) {
    let len = runLength;
    if (history[0] === 0) len += size;
    history.unshift(len);
    history.pop();
  }

  function finderPenaltyTerminateAndCount(currentColor: boolean, currentRunLength: number, history: number[]): number {
    let runLength = currentRunLength;
    if (currentColor) {
      finderPenaltyAddHistory(runLength, history);
      runLength = 0;
    }
    runLength += size;
    finderPenaltyAddHistory(runLength, history);
    return finderPenaltyCountPatterns(history);
  }

  function getPenaltyScore(): number {
    let result = 0;

    for (let y = 0; y < size; y++) {
      let runColor = false;
      let runX = 0;
      const history = [0, 0, 0, 0, 0, 0, 0];
      for (let x = 0; x < size; x++) {
        if (modules[y][x] === runColor) {
          runX++;
          if (runX === 5) result += PENALTY_N1;
          else if (runX > 5) result += 1;
        } else {
          finderPenaltyAddHistory(runX, history);
          if (!runColor) result += finderPenaltyCountPatterns(history) * PENALTY_N3;
          runColor = modules[y][x];
          runX = 1;
        }
      }
      result += finderPenaltyTerminateAndCount(runColor, runX, history) * PENALTY_N3;
    }

    for (let x = 0; x < size; x++) {
      let runColor = false;
      let runY = 0;
      const history = [0, 0, 0, 0, 0, 0, 0];
      for (let y = 0; y < size; y++) {
        if (modules[y][x] === runColor) {
          runY++;
          if (runY === 5) result += PENALTY_N1;
          else if (runY > 5) result += 1;
        } else {
          finderPenaltyAddHistory(runY, history);
          if (!runColor) result += finderPenaltyCountPatterns(history) * PENALTY_N3;
          runColor = modules[y][x];
          runY = 1;
        }
      }
      result += finderPenaltyTerminateAndCount(runColor, runY, history) * PENALTY_N3;
    }

    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        if (modules[y][x] === modules[y][x + 1] && modules[y][x] === modules[y + 1][x] && modules[y][x] === modules[y + 1][x + 1]) {
          result += PENALTY_N2;
        }
      }
    }

    let dark = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (modules[y][x]) dark++;
    const total = size * size;
    const k = Math.floor((Math.abs(dark * 20 - total * 10) + total - 1) / total) - 1;
    result += k * PENALTY_N4;

    return result;
  }

  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormatBits(mask);
    const penalty = getPenaltyScore();
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
    applyMask(mask); // desfaz (XOR duas vezes anula)
  }
  applyMask(bestMask);
  drawFormatBits(bestMask);

  return modules;
}
