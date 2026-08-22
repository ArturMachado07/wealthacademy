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
};

export default nextConfig;
