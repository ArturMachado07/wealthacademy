/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
