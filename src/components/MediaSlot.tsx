import Image from "next/image";
import { findPublicImage } from "@/lib/media";

type Props = {
  baseName: string;
  alt: string;
  className?: string;
  sizes?: string;
  tone?: "dark" | "light";
  priority?: boolean;
};

// Componente preparado para receber fotografia real da Wealth Academy.
// Se existir um ficheiro em /public/images/<baseName>.(jpg|jpeg|png|webp),
// mostra-o. Caso contrário, mostra um painel gráfico discreto (nunca uma
// stock photo genérica) até a imagem real ser adicionada.
export default function MediaSlot({ baseName, alt, className = "", sizes, tone = "dark", priority }: Props) {
  const src = findPublicImage(baseName);

  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${tone === "dark" ? "bg-ink" : "bg-ink/5"} ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #C79A5D 0, transparent 50%), radial-gradient(circle at 75% 75%, #C79A5D 0, transparent 45%)",
        }}
      />
    </div>
  );
}
