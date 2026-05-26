/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Block embedding in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  // HSTS — only enable after the custom domain has SSL working
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Conservative CSP — adjust if you add Sentry, PostHog, GTM, etc.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Tailwind injects styles; Next.js inlines small scripts.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // OpenAI direct calls happen server-side, but Supabase realtime + storage are client.
      // Replace YOUR-PROJECT-REF with your actual Supabase project ref before going live.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,

  // Used by middleware + opengraph-image to construct absolute URLs
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "https://www.logisticsnex.com",
  },

  images: {
    remotePatterns: [
      // Allow loading product images from Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
      // Common CDNs for supplier logos / product images
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  async redirects() {
    return [
      // Apex → www canonical (Vercel also does this at the edge, but
      // having it here keeps behavior identical in dev/preview).
      {
        source: "/:path*",
        has: [{ type: "host", value: "logisticsnex.com" }],
        destination: "https://www.logisticsnex.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
