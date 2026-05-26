import type { MetadataRoute } from "next";

const BASE = "https://www.logisticsnex.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // public marketing sub-pages (add as you build them)
    // { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${BASE}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
