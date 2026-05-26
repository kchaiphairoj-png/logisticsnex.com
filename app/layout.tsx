import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogisticsNex — AI สำหรับงานนำเข้า-ส่งออก",
  description:
    "ระบบจัดการเอกสารนำเข้า-ส่งออกอัจฉริยะ + B2B Marketplace สำหรับ SME ไทย",
  metadataBase: new URL("https://www.logisticsnex.com"),
  openGraph: {
    title: "LogisticsNex",
    description:
      "AI Customs, HS Code Classifier, และ B2B Marketplace ในระบบเดียว",
    url: "https://www.logisticsnex.com",
    siteName: "LogisticsNex",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
