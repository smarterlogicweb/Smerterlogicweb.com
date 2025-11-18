/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "bmsventouse.fr" },
      { protocol: "https", hostname: "image.thum.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  // Build a minimal standalone server for custom hosting platforms (e.g., Docker, generic PaaS).
  // Safe to keep for Vercel as well.
  output: "standalone",
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    localeDetection: false,
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      // add HubSpot domains
      "script-src 'self' https://plausible.io https://analytics.umami.is https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://snap.licdn.com https://static.hotjar.com https://script.hotjar.com https://js.hs-scripts.com https://js.hs-analytics.net https://js.hsforms.net",
      "connect-src 'self' https://plausible.io https://analytics.umami.is https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://px.ads.linkedin.com https://www.facebook.com https://connect.facebook.net https://graph.facebook.com https://region1.hotjar.com https://api.sanity.io https://apicdn.sanity.io https://cdn.sanity.io https://afuqy886.api.sanity.io https://api.hubapi.com https://track.hubspot.com wss:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.gstatic.com https://www.google-analytics.com https://px.ads.linkedin.com https://www.facebook.com https://cdn.sanity.io https://track.hubspot.com https://api.qrserver.com",
      "font-src 'self'",
      "frame-src 'self' https://www.google.com https://www.googletagmanager.com https://forms.hubspot.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "report-to csp-endpoint",
      "report-uri /api/csp-report",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Report-To", value: '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"https://smarterlogicweb.com/api/csp-report"}],"include_subdomains":true}' },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        source: "/:all*.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      { source: "/favicon.ico", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/favicon-32x32.png", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/favicon-16x16.png", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/apple-touch-icon.png", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/android-chrome-192x192.png", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/android-chrome-512x512.png", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/manifest.webmanifest", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/icon", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/icon-192", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/icon-512", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/apple-touch-icon", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
    ];
  },
  async rewrites() {
    return [
      { source: "/sitemap.xml", destination: "/sitemap" },
      { source: "/robots.txt", destination: "/robots" },
    ];
  },
  async redirects() {
    return [
      { source: "/creation-site-internet-france", destination: "/villes-intervention", permanent: true },
      { source: "/cout-site-vitrine-2025", destination: "/blog/cout-site-vitrine-2025", permanent: true },
      { source: "/frais-caches-site-internet", destination: "/blog/frais-caches-site-internet", permanent: true },
      { source: "/freelance-agence-builder-comparatif", destination: "/blog/freelance-agence-builder-comparatif", permanent: true },
      { source: "/roi-site-vitrine-tpe", destination: "/blog/roi-site-vitrine-tpe", permanent: true },
      { source: "/google-my-business-ou-site-web", destination: "/blog/google-my-business-ou-site-web", permanent: true },
      { source: "/contenu-site-vitrine-conversion", destination: "/blog/contenu-site-vitrine-conversion", permanent: true },
      { source: "/delai-creation-site-web", destination: "/blog/delai-creation-site-web", permanent: true },
      { source: "/role-client-creation-site-web", destination: "/blog/role-client-creation-site-web", permanent: true },
      { source: "/cout-maintenance-site-web", destination: "/blog/cout-maintenance-site-web", permanent: true },
      { source: "/contenu-forfait-maintenance-site-web", destination: "/blog/contenu-forfait-maintenance-site-web", permanent: true },
      { source: "/site-statique-vs-cms-autonomie", destination: "/blog/site-statique-vs-cms-autonomie", permanent: true },
      { source: "/referencement-seo-site-statique", destination: "/blog/referencement-seo-site-statique", permanent: true },
      { source: "/bases-techniques-seo-site-vitrine", destination: "/blog/bases-techniques-seo-site-vitrine", permanent: true },
      { source: "/hebergement-infrastructure-garanties-prestataire", destination: "/blog/hebergement-infrastructure-garanties-prestataire", permanent: true },
      { source: "/temps-chargement-site-rapide-mobile", destination: "/blog/temps-chargement-site-rapide-mobile", permanent: true },
    ];
  },
};

export default nextConfig;