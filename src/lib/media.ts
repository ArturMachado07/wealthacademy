import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

// Procura uma imagem real em /public/images/<baseName>.<ext>. Basta o
// ficheiro existir com esse nome para o componente MediaSlot passar a
// mostrá-la automaticamente, sem alterar código.
export function findPublicImage(baseName: string): string | null {
  for (const ext of EXTENSIONS) {
    const filePath = path.join(process.cwd(), "public", "images", `${baseName}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `/images/${baseName}.${ext}`;
    }
  }
  return null;
}
