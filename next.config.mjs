/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O MediaSlot (src/components/MediaSlot.tsx) verifica em runtime, via
  // fs.existsSync, se existe uma imagem em public/images/<nome>.<ext> — mas
  // como o caminho é montado dinamicamente, a Vercel não inclui esses
  // ficheiros nas funções do servidor por defeito (só ficheiros
  // referenciados de forma estática são detectados). Isto força a inclusão
  // de toda a pasta public/images em todas as rotas, para o fs conseguir
  // encontrar as imagens em produção.
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./public/images/**"],
    },
  },
  images: {
    remotePatterns: [],
    // Os SVGs usados aqui são só os nossos ficheiros de marca (logótipos),
    // não uploads de terceiros — por isso é seguro permitir a optimização
    // de SVG, que o Next bloqueia por defeito.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Cabeçalhos de segurança HTTP base (auditoria de pré-lançamento, Fase 1).
  // Não inclui um Content-Security-Policy geral de página de propósito: o
  // site carrega scripts de terceiros (Google Analytics, Meta Pixel) via
  // next/script quando configurados, e um CSP rigoroso exigiria nonces em
  // cada um deles — a fazer com cuidado numa fase própria, para não partir
  // esses scripts silenciosamente.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
