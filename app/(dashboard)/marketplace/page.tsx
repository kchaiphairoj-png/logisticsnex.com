/**
 * /marketplace — Server Component (discover page)
 *
 * Fetches stats, featured suppliers, and trending products from Supabase in
 * parallel. The AI matcher hero stays as a Client Component because it owns
 * the search form state and calls /api/ai/match-suppliers.
 */
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Globe,
  ArrowRight,
  Send,
  Building2,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SupplierCard,
  ProductCard,
} from "@/components/marketplace/supplier-card";
import { MarketplaceHero } from "./marketplace-hero";
import {
  getFeaturedSuppliers,
  getTrendingProducts,
  getMarketplaceStats,
} from "@/lib/queries/marketplace";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Categories shown in the "หมวดยอดนิยม" strip — static for now. */
const CATEGORIES = [
  { slug: "electronics", name: "อิเล็กทรอนิกส์", emoji: "🔌", hs_chapter: "85" },
  { slug: "solar",       name: "พลังงาน / โซลาร์", emoji: "☀️", hs_chapter: "85" },
  { slug: "apparel",     name: "เสื้อผ้า / สิ่งทอ",  emoji: "👕", hs_chapter: "61" },
  { slug: "cosmetics",   name: "เครื่องสำอาง",       emoji: "💄", hs_chapter: "33" },
  { slug: "home",        name: "ของใช้ในบ้าน",       emoji: "🏠", hs_chapter: "94" },
  { slug: "machinery",   name: "เครื่องจักร",        emoji: "⚙️", hs_chapter: "84" },
  { slug: "hardware",    name: "ฮาร์ดแวร์",          emoji: "🔩", hs_chapter: "73" },
  { slug: "auto",        name: "ยานยนต์ / ชิ้นส่วน", emoji: "🚗", hs_chapter: "87" },
];

export default async function MarketplacePage() {
  const [stats, featured, trending] = await Promise.all([
    getMarketplaceStats(),
    getFeaturedSuppliers(6),
    getTrendingProducts(6),
  ]);

  const statCards = [
    {
      label: "Verified Suppliers",
      value: stats.verified_supplier_count.toLocaleString(),
      sub: `ใน ${stats.countries_represented} ประเทศ`,
      icon: ShieldCheck,
      color: "text-emerald-400",
    },
    {
      label: "สินค้าที่ classify HS Code แล้ว",
      value: stats.classified_product_count.toLocaleString(),
      sub: "พร้อม Form E",
      icon: Sparkles,
      color: "text-blue-400",
    },
    {
      label: "RFQ ที่ได้ quotes ใน 24 ชม.",
      value: "94%",
      sub: "เฉลี่ย 3.2 ใบเสนอ",
      icon: TrendingUp,
      color: "text-sky-400",
    },
    {
      label: "ประหยัดอากรเฉลี่ยต่อ shipment",
      value: "฿42K",
      sub: "ผ่าน FTA matching",
      icon: Award,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero (Client — owns AI-matcher form state) */}
      <MarketplaceHero />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-secondary",
                    s.color
                  )}
                >
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
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORIES.map((c) => (
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
                HS {c.hs_chapter}
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
        </div>
        {featured.length === 0 ? (
          <EmptyState
            title="ยังไม่มี supplier ในระบบ"
            hint="seed-marketplace.sql จะเพิ่ม 6 supplier ตัวอย่างให้ดู"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>
        )}
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
        {trending.length === 0 ? (
          <EmptyState
            title="ยังไม่มีสินค้าในระบบ"
            hint="ผูกหน้านี้กับข้อมูลจริงแล้ว — seed ให้เห็นตัวอย่าง"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
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

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
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
