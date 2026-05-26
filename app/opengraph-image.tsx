import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LogisticsNex — AI Trade Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)",
          color: "white",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Grid backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            ✨
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>LogisticsNex</div>
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              AI Trade Platform
            </div>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 16px",
              borderRadius: 9999,
              background: "rgba(59,130,246,0.2)",
              border: "1px solid rgba(59,130,246,0.4)",
              color: "#93C5FD",
              fontSize: 18,
              alignSelf: "flex-start",
            }}
          >
            ⚡ สำหรับ SME ไทย
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              marginTop: 24,
              letterSpacing: -1,
            }}
          >
            AI สำหรับงาน
            <br />
            <span style={{ color: "#60A5FA" }}>นำเข้า-ส่งออก</span> ครบวงจร
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.7)",
              marginTop: 24,
              lineHeight: 1.4,
            }}
          >
            สกัด Invoice ใน 8 วิ · จัด HS Code อัตโนมัติ · หา supplier จีนพร้อม Form E
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <div>www.logisticsnex.com</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>22,418 HS Codes</span>
            <span>·</span>
            <span>2,108 Suppliers</span>
            <span>·</span>
            <span>96% Accuracy</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
