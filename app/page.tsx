import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  FileText,
  Package,
  Store,
  CheckCircle2,
  Star,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[800px] overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute -top-20 right-1/4 h-[400px] w-[600px] rounded-full bg-sky-500/15 blur-[100px]" />
      </div>
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold">LogisticsNex</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground -mt-0.5">
                AI Trade Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#how" className="text-muted-foreground hover:text-foreground">
              วิธีใช้งาน
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">
              ราคา
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">
              ติดต่อ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex px-3 py-2"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ทดลองฟรี 14 วัน
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 text-center lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            แพลตฟอร์ม AI สำหรับงานนำเข้า-ส่งออกของ SME ไทย
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            ลด <span className="text-primary">ภาษีนำเข้า</span>
            <br />
            เพิ่ม <span className="text-emerald-400">ความเร็ว</span>
            <br />
            หา <span className="text-sky-400">supplier</span> ที่ใช่
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            AI สกัด Invoice ใน 8 วินาที · จัด HS Code 22,418 พิกัดอัตโนมัติ ·
            หา supplier จีนพร้อม Form E · ทุกอย่างในระบบเดียว
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              เริ่มทดลองฟรี
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-medium hover:bg-accent"
            >
              ดู demo
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ · ข้อมูลเก็บใน TH region
          </p>

          {/* Stats strip */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto">
            {[
              { value: "8s", label: "วิเคราะห์ Invoice ต่อฉบับ", sub: "เร็วกว่า manual 1,800×" },
              { value: "96%", label: "ความแม่นยำ HS Code", sub: "จาก 22,418 รหัสไทย" },
              { value: "฿42K", label: "ประหยัดอากรเฉลี่ย", sub: "ต่อ shipment ผ่าน FTA" },
              { value: "2,108", label: "Verified Suppliers", sub: "ใน 14 ประเทศ" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card/50 p-5 backdrop-blur">
                <p className="text-2xl font-bold text-primary tabular-nums">{s.value}</p>
                <p className="mt-1 text-sm font-medium">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-border/50 bg-card/30 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
              ไว้วางใจโดย SME ไทยใน 14 อุตสาหกรรม
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-muted-foreground">
              <span>· Solar Energy</span>
              <span>· Auto Parts</span>
              <span>· Apparel</span>
              <span>· Beauty / Cosmetics</span>
              <span>· Electronics</span>
              <span>· Home Appliances</span>
              <span>· Food &amp; Beverage</span>
            </div>
          </div>
        </section>

        {/* Features — 3 pillars */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary">3 ระบบในแพลตฟอร์มเดียว</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              ครบเครื่องตั้งแต่ supplier ถึงพิธีการศุลกากร
            </h2>
            <p className="mt-3 text-muted-foreground">
              ไม่ต้องใช้ Excel, ไม่ต้องจ้างชิปปิ้ง, ไม่ต้องเสียเวลาเปิด Alibaba
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            <FeatureCard
              icon={FileText}
              accent="from-blue-500/20 to-blue-600/5 ring-blue-500/30 text-blue-400"
              title="AI Document Extractor"
              desc="อัปโหลด Invoice / Packing List → AI สกัด supplier, buyer, line items, มูลค่า, currency ภายใน 8 วินาที"
              highlights={[
                "รองรับ PDF + รูปถ่าย + สแกน",
                "วันที่ พ.ศ. → ค.ศ. อัตโนมัติ",
                "ปฏิเสธรับเอกสารปลอม/ไม่ใช่ invoice",
              ]}
            />
            <FeatureCard
              icon={Sparkles}
              accent="from-emerald-500/20 to-emerald-600/5 ring-emerald-500/30 text-emerald-400"
              title="HS Code Classifier"
              desc="AI วิเคราะห์รหัสศุลกากร 8 หลักตามหลักเกณฑ์ GIR 1-6 พร้อมแนะนำ Form E ที่ใช้ได้"
              highlights={[
                "22,418 พิกัดศุลกากรไทย",
                "RAG ค้นจาก reference DB ไม่ hallucinate",
                "บอกประหยัดอากรเป็น ฿ ทันที",
              ]}
              popular
            />
            <FeatureCard
              icon={Store}
              accent="from-sky-500/20 to-sky-600/5 ring-sky-500/30 text-sky-400"
              title="B2B Marketplace + AI Matching"
              desc="โพสต์ความต้องการ → AI หา supplier จีน/เวียดนาม/เกาหลีที่ตรงสเปก พร้อม Form E ใน 10 วินาที"
              highlights={[
                "Supplier verified ผ่าน SGS / BV / TÜV",
                "Trade Assurance escrow ป้องกันสแกม",
                "เปรียบเทียบ quotes side-by-side",
              ]}
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-border/50 bg-card/20">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-sm font-medium text-primary">วิธีใช้งาน</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                จาก Invoice ถึงใบขนสินค้า ใน 3 ขั้นตอน
              </h2>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3 relative">
              <Step
                n="01"
                title="อัปโหลดเอกสาร"
                desc="ลาก Invoice หรือ Packing List เข้ามา — รองรับ PDF, JPG, PNG หลายไฟล์พร้อมกัน"
              />
              <Step
                n="02"
                title="AI วิเคราะห์อัตโนมัติ"
                desc="ใน 8 วินาที AI สกัดข้อมูล, จัด HS Code, คำนวณภาษี + อากร, แนะนำ Form E"
              />
              <Step
                n="03"
                title="ยื่นผ่าน e-Customs"
                desc="ส่งใบขนสินค้า Form 0307 ผ่าน Paperless ตรง — หรือ export ให้ชิปปิ้งของคุณ"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary">ราคา</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              ราคาที่ตรงไปตรงมา ไม่มี hidden fee
            </h2>
            <p className="mt-3 text-muted-foreground">
              ทดลองฟรี 14 วัน · ปรับเปลี่ยน plan ได้ทุกเมื่อ
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              tagline="SME เริ่มต้น"
              price="฿990"
              features={[
                "เอกสาร 50 ฉบับ/เดือน",
                "HS Code 200 ครั้ง",
                "ผู้ใช้ 2 คน",
                "Email support",
              ]}
            />
            <PricingCard
              name="Professional"
              tagline="ยอดนิยม"
              price="฿2,990"
              popular
              features={[
                "เอกสาร 500 ฉบับ/เดือน",
                "HS Code 2,000 ครั้ง",
                "ผู้ใช้ 10 คน",
                "B2B Marketplace + AI Matching",
                "API + Webhook",
                "Priority support",
              ]}
            />
            <PricingCard
              name="Enterprise"
              tagline="ติดต่อทีมขาย"
              price="ติดต่อ"
              features={[
                "ไม่จำกัดเอกสาร / HS Code",
                "ไม่จำกัดผู้ใช้",
                "Dedicated server (TH)",
                "SLA 99.9% uptime",
                "Account manager",
              ]}
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border/50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-blue-600/15 via-card to-card p-10 text-center lg:p-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                พร้อมประหยัดเวลาและภาษีแล้วใช่ไหม?
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                สมัครฟรี — ทดลองทุกฟีเจอร์ 14 วัน ไม่ต้องผูกบัตรเครดิต
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  เริ่มทดลองฟรี <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  เข้าสู่ระบบ →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <p className="text-base font-semibold">LogisticsNex</p>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                AI Trade Platform สำหรับ SME ไทย จัดการเอกสาร, HS Code,
                และ supplier ในที่เดียว
              </p>
              <div className="mt-4 flex gap-2">
                <a className="rounded-md border border-border p-2 hover:bg-accent" aria-label="Twitter">
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                </a>
                <a className="rounded-md border border-border p-2 hover:bg-accent" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                </a>
                <a className="rounded-md border border-border p-2 hover:bg-accent" aria-label="GitHub">
                  <Github className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </div>

            <FooterCol
              title="ผลิตภัณฑ์"
              items={[
                { label: "Document AI", href: "/#features" },
                { label: "HS Code Classifier", href: "/#features" },
                { label: "B2B Marketplace", href: "/#features" },
                { label: "ราคา", href: "/#pricing" },
              ]}
            />
            <FooterCol
              title="บริษัท"
              items={[
                { label: "เกี่ยวกับเรา", href: "#" },
                { label: "ข่าวสาร", href: "#" },
                { label: "ร่วมงาน", href: "#" },
                { label: "ติดต่อ", href: "mailto:hello@logisticsnex.com" },
              ]}
            />
            <FooterCol
              title="กฎหมาย"
              items={[
                { label: "เงื่อนไขการใช้งาน", href: "/terms" },
                { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
                { label: "PDPA Compliance", href: "/pdpa" },
                { label: "Cookie Policy", href: "/cookies" },
              ]}
            />
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LogisticsNex Co., Ltd. · จดทะเบียนในประเทศไทย
            </p>
            <p className="text-xs text-muted-foreground">
              hello@logisticsnex.com · www.logisticsnex.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  accent,
  title,
  desc,
  highlights,
  popular,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  title: string;
  desc: string;
  highlights: string[];
  popular?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border bg-card p-6 ${popular ? "border-primary/40 shadow-xl shadow-primary/5" : "border-border"}`}>
      {popular && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
          <Star className="h-3 w-3 fill-current" />
          แม่นยำที่สุด
        </div>
      )}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <ul className="mt-4 space-y-2 border-t border-border pt-4">
        {highlights.map((h) => (
          <li key={h} className="flex gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="relative rounded-xl border border-border bg-card p-6">
      <p className="text-6xl font-bold text-primary/20 tabular-nums">{n}</p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({
  name,
  tagline,
  price,
  features,
  popular,
}: {
  name: string;
  tagline: string;
  price: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div className={`relative flex flex-col rounded-2xl border bg-card p-6 ${popular ? "border-primary ring-2 ring-primary/30 shadow-xl shadow-primary/5" : "border-border"}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
          <Sparkles className="h-3 w-3" />
          แนะนำ
        </div>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-xs text-muted-foreground">{tagline}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">{price}</span>
        {price !== "ติดต่อ" && <span className="text-sm text-muted-foreground">/ เดือน</span>}
      </div>
      <ul className="mt-6 space-y-2.5 text-sm flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/sign-up"
        className={`mt-6 inline-flex h-10 items-center justify-center rounded-md text-sm font-medium ${
          popular
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border hover:bg-accent"
        }`}
      >
        {price === "ติดต่อ" ? "ติดต่อทีมขาย" : "เริ่มใช้งาน"}
      </Link>
    </div>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link href={i.href} className="text-sm text-muted-foreground hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
