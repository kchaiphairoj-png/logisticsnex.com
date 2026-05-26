"use client";
import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ShieldCheck,
  TrendingUp,
  Globe,
  ArrowRight,
  Send,
  Building2,
  Award,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  suppliers,
  products,
  categories,
  getSupplier,
} from "@/lib/marketplace-data";
import {
  SupplierCard,
  ProductCard,
} from "@/components/marketplace/supplier-card";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Verified Suppliers", value: "2,108", sub: "ใน 14 ประเทศ", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "สินค้าที่ classify HS Code แล้ว", value: "47,212", sub: "พร้อม Form E", icon: Sparkles, color: "text-blue-400" },
  { label: "RFQ ที่ได้ quotes ใน 24 ชม.", value: "94%", sub: "เฉลี่ย 3.2 ใบเสนอ", icon: TrendingUp, color: "text-sky-400" },
  { label: "ประหยัดอากรเฉลี่ยต่อ shipment", value: "฿42K", sub: "ผ่าน FTA matching", icon: Award, color: "text-amber-400" },
];

// Pretend AI match results — in production this comes from
// POST /api/ai/match-suppliers with the user's free-text query.
const aiMatches = [
  { supplier_id: "sup-001", score: 0.94, reason: "ผลิต hybrid inverter ตรงสเปก, ออก Form E ลดอากร 10% → 0%, ส่งจาก Shekou ใช้ 18-25 วัน" },
  { supplier_id: "sup-006", score: 0.81, reason: "มี air purifier line คล้ายกัน ปริมาณการขายสูงในไทย แต่ราคา MOQ สูงกว่า" },
  { supplier_id: "sup-004", score: 0.42, reason: "ไม่ตรงหมวด — เป็น cosmetics ไม่ใช่ electronics" },
];

export default function MarketplacePage() {
  const [query, setQuery] = React.useState("");
  const [origin, setOrigin] = React.useState("any");
  const [requireFormE, setRequireFormE] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [matched, setMatched] = React.useState<typeof aiMatches | null>(null);

  const handleMatch = () => {
    if (!query.trim()) return;
    setSearching(true);
    // simulate AI call
    setTimeout(() => {
      setMatched(aiMatches);
      setSearching(false);
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero with AI matching */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-blue-600/15 via-card to-card p-6 lg:p-8">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI Matching for Thai SMEs
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
            หา supplier ที่ <span className="text-primary">ใช่</span> ใน 10 วินาที
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            พิมพ์สิ่งที่คุณต้องการเป็นภาษาไทยปกติ — AI จะหา supplier ที่ตรงสเปก
            มี Form E พร้อม, ส่งของไปไทยทันเวลา, และคำนวณภาษีที่จะประหยัดได้ให้
          </p>

          {/* Search */}
          <div className="mt-6 rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder='เช่น "อินเวอร์เตอร์ 5kW จำนวน 50 ตัว ราคา 800$ ต้องการ Form E"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMatch()}
                  className="h-11 border-0 bg-transparent pl-9 text-sm focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-11 w-32 text-xs"
                >
                  <option value="any">ทุกประเทศ</option>
                  <option value="CN">🇨🇳 จีน</option>
                  <option value="VN">🇻🇳 เวียดนาม</option>
                  <option value="KR">🇰🇷 เกาหลี</option>
                  <option value="JP">🇯🇵 ญี่ปุ่น</option>
                  <option value="IN">🇮🇳 อินเดีย</option>
                </Select>
                <label className="flex h-11 items-center gap-2 rounded-md border border-border px-3 cursor-pointer hover:bg-accent">
                  <input
                    type="checkbox"
                    checked={requireFormE}
                    onChange={(e) => setRequireFormE(e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-xs">มี Form E</span>
                </label>
                <Button onClick={handleMatch} disabled={searching || !query.trim()} size="lg" className="h-11">
                  {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI กำลังหา...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI Match
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Example queries */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted-foreground">ตัวอย่าง:</span>
              {[
                "เซรั่มวิตามินซี 3000 ชิ้น GMP",
                "เสื้อยืดคอตตอน 500 ตัว",
                "เครื่องฟอกอากาศ Tuya 100 เครื่อง",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                  }}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* AI Match results */}
          {matched && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI พบ {matched.length} supplier ที่ตรงสเปก
                </h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/marketplace/rfq/new">
                    ส่ง RFQ ให้ทั้งหมด
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {matched.map((m) => {
                  const s = getSupplier(m.supplier_id);
                  if (!s) return null;
                  return (
                    <SupplierCard
                      key={m.supplier_id}
                      supplier={s}
                      matchScore={m.score}
                      matchReason={m.reason}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-secondary", s.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">หมวดสินค้ายอดนิยม</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              จัดกลุ่มตามพิกัดศุลกากร เพื่อหา supplier ตรงประเภท
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace/categories">
              ดูทั้งหมด <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/marketplace?cat=${c.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-accent"
            >
              <div className="text-3xl transition-transform group-hover:scale-110">
                {c.emoji}
              </div>
              <p className="text-xs font-medium text-center line-clamp-2">
                {c.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {c.supplier_count} suppliers
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* RFQ CTA */}
      <section className="rounded-xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <Send className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ยังไม่เจอที่ใช่? ส่ง RFQ</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                โพสต์ความต้องการของคุณ — supplier ที่ตรงจะส่งใบเสนอราคามาให้
                ภายใน 24 ชม. (94% ของ RFQ ได้รับ quote เฉลี่ย 3.2 ใบ)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" asChild>
              <Link href="/marketplace/rfq">ดู RFQ ของฉัน</Link>
            </Button>
            <Button asChild>
              <Link href="/marketplace/rfq/new">
                <Sparkles className="h-4 w-4" />
                ส่ง RFQ ใหม่
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured suppliers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Verified Suppliers แนะนำ</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ผ่านการตรวจสอบใบทะเบียน + factory audit + trade history
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace/suppliers">
              ดูทั้งหมด <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.slice(0, 6).map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
        </div>
      </section>

      {/* Trending products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">สินค้ามาแรงในไทย</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ทุกชิ้นมี HS Code + Form E พร้อมแสดง
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} supplier={getSupplier(p.supplier_id)} />
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          ทำไมต้อง LogisticsNex Marketplace
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={Sparkles}
            title="HS Code พร้อมทุกสินค้า"
            desc="AI วิเคราะห์รหัสศุลกากร 8 หลักให้ทุกผลิตภัณฑ์ในระบบ — คุณรู้อากรล่วงหน้าก่อนสั่ง"
          />
          <Feature
            icon={ShieldCheck}
            title="Form E / RCEP ตรวจสอบแล้ว"
            desc="เห็นชัดว่า supplier ไหนออกใบรับรองแหล่งกำเนิดได้จริง — ประหยัดอากร 5-20%"
          />
          <Feature
            icon={Building2}
            title="ตรวจสอบใบทะเบียนพาณิชย์"
            desc="ทุก Verified Supplier ผ่าน SGS / BV / TÜV audit — ลดความเสี่ยงสแกม"
          />
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
