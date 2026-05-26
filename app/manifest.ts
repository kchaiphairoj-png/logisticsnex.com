import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LogisticsNex — AI Trade Platform",
    short_name: "LogisticsNex",
    description:
      "ระบบจัดการเอกสารนำเข้า-ส่งออกอัจฉริยะ + B2B Marketplace สำหรับ SME ไทย",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#3b82f6",
    lang: "th",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
