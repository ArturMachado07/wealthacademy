import Image from "next/image";

// Avatar circular simples — mostra a foto (avatar_url) quando existe, ou
// as iniciais do nome como placeholder (nunca stock photo). Usado no
// dashboard e no perfil do aluno.
export default function Avatar({
  url,
  name,
  size = 56,
  className,
}: {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?";

  if (url) {
    // A foto vem do bucket público do Supabase Storage — remotePatterns já
    // configurado em next.config.mjs a partir do próprio domínio do
    // projecto, por isso next/image funciona em qualquer ambiente.
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gold/15 font-semibold text-gold-dark ${className ?? ""}`}
    >
      {initials}
    </div>
  );
}
