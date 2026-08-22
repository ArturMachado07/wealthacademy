import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

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
      return `/images/${clean}.${ext}`;
    }
  }
  return null;
}
