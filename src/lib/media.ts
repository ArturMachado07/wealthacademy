import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

// Assinatura curta do conteúdo do ficheiro (não do nome/caminho) — usada
// como cache-buster na URL devolvida por findPublicImage. Sem isto, trocar
// a foto mantendo o mesmo nome de ficheiro (o fluxo normal: substituir
// banner-hero.webp por uma versão nova) fazia com que browsers e CDN
// continuassem a servir a versão antiga em cache, mesmo depois de um novo
// deploy — alguns dispositivos viam a foto certa, outros a antiga,
// consoante o que cada um já tinha em cache.
function fileVersion(filePath: string): string {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(buffer).digest("hex").slice(0, 10);
  } catch {
    return "0";
  }
}

// Procura uma imagem real em /public/images/<baseName>.<ext>. Basta o
// ficheiro existir com esse nome para o componente MediaSlot passar a
// mostrá-la automaticamente, sem alterar código.
export function findPublicImage(baseName: string): string | null {
  // Tolerante a quem escreve o nome já com extensão (ex.: "foto.webp")
  // no campo "Foto" do Admin — evita procurar por "foto.webp.webp".
  const clean = baseName.replace(/\.(jpg|jpeg|png|webp)$/i, "");

  for (const ext of EXTENSIONS) {
    const filePath = path.join(process.cwd(), "public", "images", `${clean}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `/images/${clean}.${ext}?v=${fileVersion(filePath)}`;
    }
  }
  return null;
}
