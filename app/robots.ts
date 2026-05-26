import type { MetadataRoute } from "next";

const BASE = "https://www.logisticsnex.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up"],
        disallow: [
          "/api/",
          "/dashboard",
          "/upload",
          "/analysis",
          "/marketplace",
          "/billing",
          "/settings",
          "/account",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
