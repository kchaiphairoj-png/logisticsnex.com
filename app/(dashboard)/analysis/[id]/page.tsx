"use client";
import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Sparkles,
  Users,
  Package,
  TrendingUp,
  Eye,
  History,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineItemsList } from "@/components/dashboard/line-items-list";
import { DutySummary } from "@/components/dashboard/duty-summary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const docMeta = [
  { label: "เลขที่ Invoice", value: "INV-SHZ-2025-04122" },
  { label: "วันที่เอกสาร", value: "18 พ.ค. 2568" },
  { label: "Supplier", value: "Shenzhen Tech Co., Ltd." },
  { label: "ประเทศต้นทาง", value: "🇨🇳 จีน (Shenzhen)" },
  { label: "Incoterm", value: "CIF Bangkok" },
  { label: "สกุลเงิน", value: "USD (1 USD = 36.0 THB)" },
  { label: "วิธีขนส่ง", value: "Sea Freight · MAEU-2025-04122" },
  { label: "พอร์ตปลายทาง", value: "Laem Chabang (THLCH)" },
];

const stats = [
  {
    label: "จำนวนรายการ",
    value: "4",
    sub: "สินค้าใน Invoice",
    icon: Package,
    color: "text-sky-400",
    bg: "from-sky-500/20 to-sky-500/5",
  },
  {
    label: "ความมั่นใจ AI เฉลี่ย",
    value: "87.3%",
    sub: "2 รายการต่ำกว่าเกณฑ์",
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    label: "มูลค่ารวม (THB)",
    value: "฿649,260",
    sub: "USD 18,035",
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "from-amber-500/20 to-amber-500/5",
  },
  {
    label: "อากร + VAT",
    value: "฿110,483",
    sub: "17.0% ของมูลค่า CIF",
    icon: Users,
    color: "text-rose-400",
    bg: "from-rose-500/20 to-rose-500/5",
  },
];

export default function AnalysisPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/analysis" className="hover:text-foreground transition-colors">
          ประวัติภาษี & HS Code
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">INV-SHZ-2025-04122</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30">
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                INV-SHZ-2025-04122
              </h1>
              <Badge variant="warning">รอตรวจสอบ</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              ผลการวิเคราะห์เอกสารโดย AI · ประมวลผลใน{" "}
              <span className="text-foreground font-medium">8.2 วินาที</span> · GPT-4o
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <History className="h-3.5 w-3.5" />
            ประวัติการแก้ไข
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-3.5 w-3.5" />
            วิเคราะห์ใหม่
          </Button>
          <Button size="sm">
            <Eye className="h-3.5 w-3.5" />
            ดูเอกสารต้นฉบับ
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1",
                    s.bg,
                    "ring-current/20"
                  )}
                >
                  <Icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold tabular-nums mt-0.5">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="items">
            <TabsList>
              <TabsTrigger value="items">
                <Package className="h-3.5 w-3.5 mr-1.5" />
                รายการสินค้า
              </TabsTrigger>
              <TabsTrigger value="header">ข้อมูลส่วนหัว</TabsTrigger>
              <TabsTrigger value="ai-log">บันทึก AI</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <LineItemsList />
            </TabsContent>

            <TabsContent value="header">
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                  {docMeta.map((m) => (
                    <div key={m.label}>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {m.label}
                      </p>
                      <p className="mt-1 text-sm font-medium">{m.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-log">
              <Card>
                <CardContent className="space-y-3 p-6">
                  <LogEntry
                    time="14:32:08"
                    title="เริ่มต้น OCR เอกสาร"
                    desc="อ่านไฟล์ Invoice_SHZ-2025-04122.pdf (842 KB) ด้วย GPT-4o vision"
                  />
                  <LogEntry
                    time="14:32:11"
                    title="สกัดข้อมูลส่วนหัวสำเร็จ"
                    desc="พบ supplier, buyer, invoice no., date, incoterm, currency"
                  />
                  <LogEntry
                    time="14:32:13"
                    title="วิเคราะห์รายการสินค้า 4 รายการ"
                    desc="ส่งคำอธิบายสินค้าผ่าน HS Code RAG (22,418 codes)"
                  />
                  <LogEntry
                    time="14:32:16"
                    title="แนะนำพิกัดและคำนวณภาษี"
                    desc="ใช้ token รวม 8,420 (prompt 6,210 + completion 2,210)"
                    success
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: duty summary (sticky) */}
        <div className="lg:col-span-1">
          <DutySummary />
        </div>
      </div>
    </div>
  );
}

function LogEntry({
  time,
  title,
  desc,
  success,
}: {
  time: string;
  title: string;
  desc: string;
  success?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            success ? "bg-emerald-400" : "bg-primary"
          )}
        />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          <span className="text-xs font-mono text-muted-foreground">{time}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
