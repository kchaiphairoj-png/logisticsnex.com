import * as React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, Globe } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: hero (hidden on mobile) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">LogisticsNex</p>
            <p className="text-[11px] uppercase tracking-wider text-white/60">
              AI Trade Platform · logisticsnex.com
            </p>
          </div>
        </Link>

        {/* Pitch */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-sm font-medium text-blue-300">
              ⚡ ลดเวลาจัดทำเอกสารจาก 4 ชม. เหลือ 8 วินาที
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white">
              ระบบ AI สำหรับ
              <br />
              งานพิธีการศุลกากร
              <br />
              <span className="text-blue-300">ที่เข้าใจ SME ไทย</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
              วิเคราะห์ HS Code, คำนวณภาษีอากร, จัดทำใบขนสินค้า — ทั้งหมดในที่เดียว
              พร้อมเชื่อมต่อระบบ e-Customs โดยตรง
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, title: "เร็วกว่า 1,800×", sub: "OCR + AI ภายใน 8 วินาที" },
              { icon: ShieldCheck, title: "PDPA & ISO 27001", sub: "เก็บข้อมูลใน TH region" },
              { icon: Globe, title: "22,418 HS Codes", sub: "ครอบคลุมพิกัดไทย" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur"
                >
                  <Icon className="h-4 w-4 text-blue-300" />
                  <p className="mt-2 text-sm font-medium text-white">
                    {f.title}
                  </p>
                  <p className="text-[11px] text-white/60">{f.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: testimonial */}
        <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-sm leading-relaxed text-white/90">
            "เราใช้เวลาเตรียมใบขนน้อยลง 80% หลังจากเปลี่ยนมาใช้ LogisticsNex
            ทีมงาน 3 คนของเรารับงานได้เท่ากับทีม 12 คนสมัยก่อน"
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              ภพ
            </div>
            <div>
              <p className="text-xs font-medium text-white">ภพรัตน์ วงศ์อาษา</p>
              <p className="text-[11px] text-white/60">
                Director, Thai Logistics Solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form area */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-12">
        {children}
      </div>
    </div>
  );
}
