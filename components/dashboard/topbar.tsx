"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "หน้าแรก", subtitle: "ภาพรวมการทำงานและเอกสารของคุณ" },
  "/upload": { title: "อัปโหลดเอกสาร", subtitle: "อัปโหลด Invoice / Packing List เพื่อให้ AI วิเคราะห์" },
  "/analysis": { title: "ประวัติภาษี & HS Code", subtitle: "ผลการวิเคราะห์พิกัดศุลกากรย้อนหลัง" },
  "/marketplace": { title: "B2B Marketplace", subtitle: "หา supplier จีน + AI matching สำหรับ SME ไทย" },
  "/marketplace/rfq": { title: "RFQ ของฉัน", subtitle: "คำขอราคาที่ส่งและใบเสนอที่ได้รับ" },
  "/marketplace/suppliers": { title: "Supplier", subtitle: "รายชื่อผู้ผลิต/ผู้ส่งออกที่ตรวจสอบแล้ว" },
  "/billing": { title: "ชำระเงิน & แพ็กเกจ", subtitle: "จัดการแพ็กเกจและประวัติการชำระเงิน" },
  "/settings": { title: "การตั้งค่า", subtitle: "ตั้งค่าระบบและองค์กรของคุณ" },
  "/account": { title: "บัญชีผู้ใช้", subtitle: "ข้อมูลส่วนตัวและความปลอดภัย" },
};

export function Topbar() {
  const pathname = usePathname();
  const matchKey = Object.keys(titles)
    .filter((k) => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0] ?? "/dashboard";
  const { title, subtitle } = titles[matchKey];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ค้นหาเอกสาร, HS Code, supplier..."
            className="h-9 w-80 rounded-md border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ⌘ K
          </kbd>
        </div>

        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </Button>
        <Button size="icon" variant="ghost">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          เอกสารใหม่
        </Button>
      </div>
    </header>
  );
}
