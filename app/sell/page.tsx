import Link from "next/link";
import {
  Store,
  Globe,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplyForm } from "./apply-form";

export const metadata = {
  title: "Sell on LogisticsNex — เปิดร้านขายให้ตลาดไทย",
  description:
    "เข้าถึงผู้ซื้อ SME ไทยกว่า 1,000 รายผ่าน LogisticsNex Marketplace — ฟรีจน close deal แรก",
};

const benefits = [
  {
    icon: Globe,
    title: "เข้าถึงผู้ซื้อไทยทันที",
    desc: "ผู้ซื้อ SME ไทยที่ผ่านการ verify แล้ว — ไม่มี tire-kicker",
  },
  {
    icon: Sparkles,
    title: "AI ช่วยจับคู่ RFQ",
    desc: "AI ของเรา rank supplier ที่ตรงสเปกที่สุด — ขึ้นเป็นอันดับ 1 ในผลลัพธ์",
  },
  {
    icon: TrendingUp,
    title: "ไม่มีค่าธรรมเนียมขึ้นต้น",
    desc: "ฟรี list สินค้า — ค่าคอมมิชชั่นเก็บแค่ตอน close deal ผ่านระบบ",
  },
  {
    icon: ShieldCheck,
    title: "ระบบ Verification",
    desc: "เราตรวจใบทะเบียน + factory audit — เพิ่มความน่าเชื่อถือต่อผู้ซื้อ",
  },
];

const stats = [
  { value: "1,200+", label: "ผู้ซื้อ SME ไทย" },
  { value: "30+", label: "Supplier verified" },
  { value: "94%", label: "RFQ ได้ quote ใน 24 ชม." },
  { value: "฿42K", label: "ประหยัดอากรเฉลี่ย/shipment" },
];

export default function SellLandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[800px] overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -top-20 right-1/4 h-[400px] w-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">LogisticsNex</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/marketplace">เป็นผู้ซื้อ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-in">เข้าสู่ระบบ</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 lg:py-20">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Store className="h-3 w-3" />
            For Manufacturers & Exporters
          </div>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            ขายเข้าตลาดไทย — <span className="text-emerald-400">ฟรีจนปิด deal แรก</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground lg:text-lg">
            LogisticsNex จับคู่ supplier ต่างประเทศกับผู้ซื้อ SME ไทยผ่าน AI
            — มีระบบ HS Code, Form E, RFQ และ Escrow ครบในที่เดียว
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <a href="#apply">
                สมัครเป็น Supplier
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/marketplace">ดูตัวอย่าง Marketplace</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              ทำไม supplier ทั่วโลก<br />
              เลือกขายผ่าน LogisticsNex
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <Card key={b.title}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold">{b.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {b.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-2xl border border-border bg-card p-6 lg:p-10">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight lg:text-3xl">
            ขั้นตอน — ง่ายๆ 3 ขั้นตอน
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Step
              n="1"
              title="ส่งใบสมัคร"
              desc="กรอกข้อมูลบริษัท + ตัวอย่างสินค้า — ใช้เวลา 5 นาที"
            />
            <Step
              n="2"
              title="รอ Verification"
              desc="ทีมเราตรวจใบทะเบียน + อ้างอิงลูกค้า — 2-3 วัน"
            />
            <Step
              n="3"
              title="เริ่มรับ RFQ"
              desc="ขึ้น listing — รับ RFQ จากผู้ซื้อไทย + AI Match"
            />
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="scroll-mt-20">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              สมัครเป็น Supplier
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ฟรี — ไม่มีค่าสมัคร ไม่ต้องผูกบัตรเครดิต
            </p>
          </div>
          <ApplyForm />
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>
            © 2026 LogisticsNex · มีคำถาม? อีเมล{" "}
            <a href="mailto:supplier@logisticsnex.com" className="text-primary hover:underline">
              supplier@logisticsnex.com
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white">
        {n}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
