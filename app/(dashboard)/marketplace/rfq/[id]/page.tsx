"use client";
import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Clock,
  Package,
  MessageSquare,
  CheckCircle2,
  X,
  Award,
  TrendingDown,
  Sparkles,
  Send,
  Calendar,
  Globe,
  ArrowDownToLine,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { suppliers, getSupplier } from "@/lib/marketplace-data";
import { cn, formatTHB } from "@/lib/utils";

// Mock RFQ
const rfq = {
  id: "rfq-new-001",
  title: "Hybrid Solar Inverter 5kW + Form E",
  description:
    "ต้องการ hybrid solar inverter 5kW คลื่นไซน์บริสุทธิ์ สำหรับติดตั้งระบบ off-grid solar ในโครงการ กำลังจ่ายต่อเนื่อง 5,000W, peak 10,000W, รองรับแบตเตอรี่ลิเธียม 48V, มี LCD display, ต้องการประกัน 2 ปีขึ้นไป",
  category: "Solar / พลังงาน",
  hs_code: "8504.40.90",
  quantity: 50,
  unit: "pcs",
  target_price_usd: 800,
  preferred_origin: ["CN", "VN"],
  required_certifications: ["CE", "RoHS"],
  required_form_e: true,
  incoterm: "CIF",
  delivery_port: "THBKK",
  needed_by: "2025-07-15",
  status: "open",
  expires_at: "2025-06-10",
  posted_at: "2025-05-26 14:30",
  view_count: 47,
};

// Quotes from suppliers
type Quote = {
  id: string;
  supplier_id: string;
  unit_price_usd: number;
  total_price_usd: number;
  lead_time_days: number;
  moq: number;
  incoterm: string;
  offers_form_e: boolean;
  offers_form_rcep: boolean;
  certifications: string[];
  message: string;
  valid_until: string;
  status: "submitted" | "viewed" | "shortlisted";
  match_score: number;
  posted_at: string;
};

const quotes: Quote[] = [
  {
    id: "q1",
    supplier_id: "sup-001",
    unit_price_usd: 760,
    total_price_usd: 38_000,
    lead_time_days: 22,
    moq: 10,
    incoterm: "CIF Bangkok",
    offers_form_e: true,
    offers_form_rcep: true,
    certifications: ["CE", "RoHS", "FCC"],
    message:
      "เรามี hybrid inverter 5kW รุ่น HX-5000 ตรง spec ที่ระบุ คลื่นไซน์บริสุทธิ์ THD<3% รองรับ LiFePO4 48V พร้อม WiFi monitoring ฟรี ออก Form E ให้ครบทุก shipment ผลิตในโรงงาน Shenzhen เอง ขอใบ inspection report ได้ก่อนส่ง ราคาพิเศษสำหรับ MOQ 50+",
    valid_until: "2025-06-15",
    status: "viewed",
    match_score: 0.94,
    posted_at: "2 ชม.ที่แล้ว",
  },
  {
    id: "q2",
    supplier_id: "sup-006",
    unit_price_usd: 720,
    total_price_usd: 36_000,
    lead_time_days: 28,
    moq: 25,
    incoterm: "CIF Bangkok",
    offers_form_e: true,
    offers_form_rcep: false,
    certifications: ["CE", "RoHS"],
    message:
      "ราคาดีที่สุดในตลาด เป็น OEM brand-neutral สามารถ rebrand ให้ได้ฟรี ติด stick logo ของคุณได้ ส่งจาก Huangpu port",
    valid_until: "2025-06-10",
    status: "submitted",
    match_score: 0.82,
    posted_at: "5 ชม.ที่แล้ว",
  },
  {
    id: "q3",
    supplier_id: "sup-005",
    unit_price_usd: 980,
    total_price_usd: 49_000,
    lead_time_days: 14,
    moq: 20,
    incoterm: "CIF Bangkok",
    offers_form_e: false,
    offers_form_rcep: true,
    certifications: ["CE", "RoHS", "KR-Class"],
    message:
      "Premium grade inverter จากเกาหลี ใช้ Mitsubishi IGBT คุณภาพระดับ industrial ใช้ Form AK / RCEP แทน Form E ลดอากรเหลือ 5%",
    valid_until: "2025-06-12",
    status: "submitted",
    match_score: 0.71,
    posted_at: "1 วันที่แล้ว",
  },
  {
    id: "q4",
    supplier_id: "sup-003",
    unit_price_usd: 690,
    total_price_usd: 34_500,
    lead_time_days: 35,
    moq: 100,
    incoterm: "FOB Haiphong",
    offers_form_e: false,
    offers_form_rcep: true,
    certifications: ["CE"],
    message:
      "เราเป็น sub-assembly factory ราคาถูกที่สุด แต่ MOQ 100+ เท่านั้น ขายในระดับ FOB ลูกค้าต้องจัด freight เอง",
    valid_until: "2025-06-08",
    status: "submitted",
    match_score: 0.55,
    posted_at: "2 วันที่แล้ว",
  },
];

const sortedQuotes = [...quotes].sort((a, b) => b.match_score - a.match_score);
const bestQuote = sortedQuotes[0];
const cheapest = [...quotes].sort((a, b) => a.unit_price_usd - b.unit_price_usd)[0];
const fastest = [...quotes].sort((a, b) => a.lead_time_days - b.lead_time_days)[0];

export default function RfqDetailPage() {
  const [shortlist, setShortlist] = React.useState<string[]>([bestQuote.id]);

  const toggleShortlist = (id: string) =>
    setShortlist((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:text-foreground transition-colors">
          Marketplace
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/marketplace/rfq" className="hover:text-foreground transition-colors">
          RFQ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{rfq.title}</span>
      </nav>

      {/* RFQ summary header */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-gradient-to-br from-blue-500/10 via-card to-card px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="info">เปิดรับใบเสนอ</Badge>
                <Badge variant="outline" className="font-mono">{rfq.hs_code}</Badge>
                <span className="text-xs text-muted-foreground">{rfq.category}</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                {rfq.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                {rfq.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm">
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">แก้ไข RFQ</Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4 border-t border-border pt-4">
            <RfqStat label="ปริมาณ" value={`${rfq.quantity} ${rfq.unit}`} icon={Package} />
            <RfqStat label="ราคาเป้าหมาย" value={`$${rfq.target_price_usd}/pcs`} icon={TrendingDown} />
            <RfqStat label="ต้องการภายใน" value={rfq.needed_by} icon={Calendar} />
            <RfqStat label="ใบเสนอที่ได้รับ" value={`${quotes.length} ใบ`} icon={Send} />
          </div>
        </div>
      </Card>

      {/* AI Insight banner */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-400">
                AI Insight: คำแนะนำของระบบ
              </p>
              <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                <strong>{getSupplier(bestQuote.supplier_id)?.trade_name}</strong> เป็น match ที่ดีที่สุดด้วย score{" "}
                <span className="text-emerald-400 font-semibold">{(bestQuote.match_score * 100).toFixed(0)}%</span> —
                ราคา $760/pcs (สูงกว่าต่ำสุด 10%) แต่มี Form E + รับประกัน 2 ปี +
                Trade Assurance + รีวิว 4.8 ดาว · ประหยัดอากรได้ประมาณ{" "}
                <strong className="text-emerald-400">฿136,800</strong> เมื่อใช้ Form E
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ทำไม supplier นี้ดีที่สุด
                </Button>
                <Button size="sm" variant="outline">
                  เปรียบเทียบ 3 quote แรก
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes */}
      <Tabs defaultValue="all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด ({quotes.length})</TabsTrigger>
            <TabsTrigger value="shortlist">
              Shortlist ({shortlist.length})
            </TabsTrigger>
            <TabsTrigger value="compare">เปรียบเทียบ</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>เรียงตาม:</span>
            <Badge variant="outline">AI Match Score ↓</Badge>
          </div>
        </div>

        <TabsContent value="all">
          <div className="space-y-3">
            {sortedQuotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                isShortlisted={shortlist.includes(q.id)}
                onToggleShortlist={() => toggleShortlist(q.id)}
                badges={{
                  best: q.id === bestQuote.id,
                  cheapest: q.id === cheapest.id,
                  fastest: q.id === fastest.id,
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shortlist">
          {shortlist.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                ยังไม่มี quote ใน shortlist — กด ⭐ ใน quote ที่สนใจ
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedQuotes
                .filter((q) => shortlist.includes(q.id))
                .map((q) => (
                  <QuoteCard
                    key={q.id}
                    quote={q}
                    isShortlisted
                    onToggleShortlist={() => toggleShortlist(q.id)}
                    badges={{}}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compare">
          <CompareTable quotes={sortedQuotes.slice(0, 4)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RfqStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function QuoteCard({
  quote,
  isShortlisted,
  onToggleShortlist,
  badges,
}: {
  quote: Quote;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  badges: { best?: boolean; cheapest?: boolean; fastest?: boolean };
}) {
  const supplier = getSupplier(quote.supplier_id);
  if (!supplier) return null;

  const matchColor =
    quote.match_score >= 0.9
      ? "text-emerald-400 bg-emerald-500/15"
      : quote.match_score >= 0.7
      ? "text-amber-400 bg-amber-500/15"
      : "text-rose-400 bg-rose-500/15";

  const savingsThb = Math.round(
    rfq.quantity * quote.unit_price_usd * 36 * (quote.offers_form_e ? 0.1 : 0)
  );

  return (
    <Card className={cn(
      "transition-all",
      isShortlisted && "border-amber-500/40 bg-amber-500/[0.02]"
    )}>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          {/* Supplier info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30 text-xl">
              {supplier.country_flag}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/marketplace/suppliers/${supplier.id}`}
                  className="text-sm font-semibold hover:text-primary"
                >
                  {supplier.trade_name}
                </Link>
                {supplier.is_verified && (
                  <Badge variant="success" className="h-5">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {badges.best && (
                  <Badge className="h-5 bg-emerald-500 text-white border-0">
                    <Award className="h-3 w-3" />
                    AI Best Match
                  </Badge>
                )}
                {badges.cheapest && (
                  <Badge className="h-5 bg-sky-500 text-white border-0">
                    <TrendingDown className="h-3 w-3" />
                    ราคาดีที่สุด
                  </Badge>
                )}
                {badges.fastest && (
                  <Badge className="h-5 bg-amber-500 text-white border-0">
                    <Clock className="h-3 w-3" />
                    ส่งเร็วที่สุด
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{supplier.rating.toFixed(1)}</span>
                </div>
                <span>·</span>
                <span>{supplier.city}, {supplier.country}</span>
                <span>·</span>
                <span>เสนอราคา {quote.posted_at}</span>
              </div>
            </div>
          </div>

          {/* Match score */}
          <div className={cn("flex flex-col items-center justify-center rounded-lg px-4 py-2", matchColor)}>
            <p className="text-[10px] font-medium uppercase tracking-wider">AI Score</p>
            <p className="text-xl font-bold tabular-nums">
              {(quote.match_score * 100).toFixed(0)}%
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant={isShortlisted ? "default" : "outline"}
              size="icon"
              onClick={onToggleShortlist}
              className="h-9 w-9"
            >
              <Star className={cn("h-4 w-4", isShortlisted && "fill-current")} />
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4 rounded-lg bg-secondary/40 p-3">
          <p className="text-sm leading-relaxed">{quote.message}</p>
        </div>

        {/* Numbers */}
        <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-5 border-t border-border pt-4">
          <QNumber label="ราคา / pcs" value={`$${quote.unit_price_usd}`} hint="USD" />
          <QNumber label="ราคารวม" value={`$${quote.total_price_usd.toLocaleString()}`} hint={`MOQ ${quote.moq}`} />
          <QNumber label="Lead time" value={`${quote.lead_time_days} วัน`} hint={quote.incoterm} />
          <QNumber
            label="Form E"
            value={quote.offers_form_e ? "✓ มี" : "✗ ไม่มี"}
            hint={quote.offers_form_e ? "ลด 10%" : quote.offers_form_rcep ? "มี RCEP" : "MFN เต็ม"}
            valueColor={quote.offers_form_e ? "text-emerald-400" : "text-muted-foreground"}
          />
          <QNumber
            label="ประหยัดอากร"
            value={savingsThb > 0 ? formatTHB(savingsThb) : "—"}
            hint="vs MFN"
            valueColor={savingsThb > 0 ? "text-emerald-400" : "text-muted-foreground"}
          />
        </div>

        {/* Certifications row */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-1">
            {quote.certifications.map((c) => (
              <Badge key={c} variant="outline" className="text-[10px]">
                ✓ {c}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              ใช้ได้ถึง {quote.valid_until}
            </span>
            <Button size="sm">
              ทำสัญญา / Award
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QNumber({
  label,
  value,
  hint,
  valueColor,
}: {
  label: string;
  value: string;
  hint: string;
  valueColor?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("text-base font-bold tabular-nums mt-0.5", valueColor)}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function CompareTable({ quotes }: { quotes: Quote[] }) {
  const rows = [
    { label: "ราคา/pcs (USD)", get: (q: Quote) => `$${q.unit_price_usd.toFixed(2)}` },
    { label: "ราคารวม", get: (q: Quote) => `$${q.total_price_usd.toLocaleString()}` },
    { label: "MOQ", get: (q: Quote) => `${q.moq} pcs` },
    { label: "Lead time", get: (q: Quote) => `${q.lead_time_days} วัน` },
    { label: "Incoterm", get: (q: Quote) => q.incoterm },
    { label: "Form E", get: (q: Quote) => (q.offers_form_e ? "✓" : "✗") },
    { label: "Form RCEP", get: (q: Quote) => (q.offers_form_rcep ? "✓" : "✗") },
    { label: "Certifications", get: (q: Quote) => q.certifications.join(", ") },
    { label: "AI Match", get: (q: Quote) => `${(q.match_score * 100).toFixed(0)}%` },
  ];

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-card">
                Criteria
              </th>
              {quotes.map((q) => {
                const s = getSupplier(q.supplier_id);
                return (
                  <th key={q.id} className="text-left py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s?.country_flag}</span>
                      <div>
                        <p className="text-sm font-medium">{s?.trade_name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] text-muted-foreground">
                            {s?.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={cn("border-b border-border", i % 2 === 0 && "bg-secondary/20")}>
                <td className="py-3 px-4 text-xs text-muted-foreground sticky left-0 bg-inherit">
                  {r.label}
                </td>
                {quotes.map((q) => (
                  <td key={q.id} className="py-3 px-4 text-sm font-medium tabular-nums">
                    {r.get(q)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="py-3 px-4 sticky left-0 bg-card"></td>
              {quotes.map((q) => (
                <td key={q.id} className="py-3 px-4">
                  <Button size="sm" className="w-full">Award</Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
