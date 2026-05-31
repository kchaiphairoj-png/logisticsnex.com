/**
 * /marketplace/rfq/[id] — Server Component
 *
 * Shows a buyer their RFQ and the supplier quotes it received.
 * RLS on `rfqs` restricts visibility to the org that owns it.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Clock,
  Package,
  MessageSquare,
  Award,
  Sparkles,
  Send,
  Calendar,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getRfqById, getQuotesForRfq } from "@/lib/queries/marketplace";
import { requireUser } from "@/lib/auth";
import { cn, formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const USD_TO_THB = 36; // approximate; for landed cost display only

export default async function RfqDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser(`/marketplace/rfq/${params.id}`);
  const rfq = await getRfqById(params.id);
  if (!rfq) return notFound();

  const quotes = await getQuotesForRfq(rfq.id);

  const cheapest = quotes.reduce<typeof quotes[number] | null>(
    (best, q) => (best && best.unit_price_usd <= q.unit_price_usd ? best : q),
    null
  );
  const fastest = quotes.reduce<typeof quotes[number] | null>(
    (best, q) => (best && best.lead_time_days <= q.lead_time_days ? best : q),
    null
  );
  const formESuppliers = quotes.filter((q) => q.offers_form_e).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/marketplace"
          className="hover:text-foreground transition-colors"
        >
          Marketplace
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/marketplace/rfq"
          className="hover:text-foreground transition-colors"
        >
          RFQ ของฉัน
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{rfq.title}</span>
      </nav>

      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={rfq.status === "open" ? "success" : "outline"}
                className="capitalize"
              >
                {rfq.status === "open" ? "เปิดรับ quotes" : rfq.status}
              </Badge>
              {rfq.category && (
                <span className="text-xs text-muted-foreground">{rfq.category}</span>
              )}
              {rfq.hs_code_hint && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  HS {rfq.hs_code_hint}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{rfq.title}</h1>
            <p className="text-xs text-muted-foreground">
              โพสต์เมื่อ {formatThaiDateTime(rfq.created_at)}
              {rfq.expires_at && ` · หมดอายุ ${formatThaiDate(rfq.expires_at)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">ใบเสนอราคาที่ได้รับ</p>
            <p className="text-3xl font-bold tabular-nums text-primary">
              {quotes.length}
            </p>
            <p className="text-[11px] text-muted-foreground">
              จากเปิดรับ {timeSince(rfq.created_at)}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-4 border-t border-border pt-5">
          <Stat
            label="จำนวนที่ต้องการ"
            value={`${rfq.quantity.toLocaleString()} ${rfq.quantity_unit}`}
          />
          <Stat
            label="ราคาเป้า"
            value={rfq.target_price_usd ? `$${rfq.target_price_usd}/${rfq.quantity_unit}` : "ยังไม่ระบุ"}
            accent="text-emerald-400"
          />
          <Stat
            label="ต้องการภายใน"
            value={rfq.needed_by_date ? formatThaiDate(rfq.needed_by_date) : "ยืดหยุ่น"}
          />
          <Stat
            label="Incoterm / Port"
            value={`${rfq.delivery_incoterm} ${rfq.delivery_port}`}
          />
        </div>
      </section>

      {/* AI insights */}
      {quotes.length > 0 && (
        <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-blue-600/10 via-card to-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">AI วิเคราะห์ Quotes</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                จาก {quotes.length} ใบเสนอราคาที่ได้รับ —{" "}
                {cheapest && (
                  <>
                    <b className="text-foreground">{cheapest.supplier_trade_name}</b>{" "}
                    ราคาดีที่สุด (${cheapest.unit_price_usd}/{rfq.quantity_unit}).
                  </>
                )}{" "}
                {fastest && (
                  <>
                    <b className="text-foreground">{fastest.supplier_trade_name}</b>{" "}
                    ส่งเร็วที่สุด ({fastest.lead_time_days} วัน).
                  </>
                )}{" "}
                <b className="text-emerald-400">{formESuppliers} supplier</b>{" "}
                เสนอ Form E (ลดอากรขาเข้าได้สูงสุด).
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="quotes">
            <TabsList>
              <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
              <TabsTrigger value="details">รายละเอียด RFQ</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes" className="space-y-4">
              {quotes.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center space-y-2">
                    <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      ยังไม่มี supplier ส่ง quote เข้ามา
                    </p>
                    <p className="text-xs text-muted-foreground">
                      94% ของ RFQ ได้รับ quote ภายใน 24 ชม. —{" "}
                      {timeSince(rfq.created_at)} ที่แล้ว
                    </p>
                  </CardContent>
                </Card>
              ) : (
                quotes.map((q, idx) => (
                  <QuoteCard
                    key={q.id}
                    quote={q}
                    rank={idx + 1}
                    isCheapest={cheapest?.id === q.id}
                    isFastest={fastest?.id === q.id}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียด RFQ ที่โพสต์</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      คำอธิบาย
                    </p>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">
                      {rfq.description}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <KV label="ประเทศต้นทางที่ต้องการ">
                      {rfq.preferred_origin.length > 0
                        ? rfq.preferred_origin.join(", ")
                        : "ไม่ระบุ"}
                    </KV>
                    <KV label="Form E / FTA จำเป็น">
                      {rfq.required_form_e ? "ใช่" : "ไม่"}
                      {rfq.required_form_rcep && " · Form RCEP"}
                    </KV>
                    <KV label="ใบรับรองที่ต้องการ">
                      {rfq.required_certifications.length > 0
                        ? rfq.required_certifications.join(", ")
                        : "—"}
                    </KV>
                    <KV label="ต้องการตัวอย่าง">
                      {rfq.sample_required ? "ใช่" : "ไม่"}
                    </KV>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">การดำเนินการ</CardTitle>
              <CardDescription className="text-xs">
                ปิด RFQ เมื่อได้ supplier ที่ใช่
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" size="sm" disabled>
                <Award className="h-4 w-4" />
                เลือก supplier (Award)
              </Button>
              <Button variant="outline" className="w-full" size="sm" disabled>
                <Send className="h-4 w-4" />
                ส่ง shortlist
              </Button>
              <Separator />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                การ Award จะปิด RFQ และแจ้ง supplier ที่ไม่ได้รับเลือก
                — ฟีเจอร์นี้กำลังพัฒนา
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Subcomponents
 * ──────────────────────────────────────────────────────────── */

function QuoteCard({
  quote,
  rank,
  isCheapest,
  isFastest,
}: {
  quote: Awaited<ReturnType<typeof getQuotesForRfq>>[number];
  rank: number;
  isCheapest: boolean;
  isFastest: boolean;
}) {
  const totalThb = quote.total_price_usd * USD_TO_THB;
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-secondary/30 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              #{rank}
            </span>
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <span>{quote.supplier_country_flag}</span>
                {quote.supplier_trade_name}
                {quote.supplier_is_verified && (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                ส่ง quote {timeSince(quote.created_at)} ที่แล้ว
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isCheapest && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                ราคาดี
              </Badge>
            )}
            {isFastest && (
              <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30">
                ส่งเร็ว
              </Badge>
            )}
            {quote.match_score != null && (
              <Badge variant="outline">
                AI {Math.round(quote.match_score * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="ราคาต่อหน่วย"
            value={`$${quote.unit_price_usd.toFixed(2)}`}
            accent="text-emerald-400"
          />
          <Stat
            label="MOQ"
            value={quote.moq.toLocaleString()}
          />
          <Stat
            label="ยอดรวม"
            value={`$${quote.total_price_usd.toLocaleString()}`}
            hint={`≈ ${formatTHB(totalThb)}`}
          />
          <Stat
            label="Lead time"
            value={`${quote.lead_time_days} วัน`}
            accent="text-sky-400"
          />
          <Stat
            label="Incoterm / Port"
            value={`${quote.incoterm} ${quote.ships_from_port ?? ""}`.trim()}
          />
          <Stat
            label="หมดอายุ"
            value={quote.valid_until ? formatThaiDate(quote.valid_until) : "—"}
          />
        </div>

        {quote.message && (
          <div className="rounded-md bg-secondary/40 px-3 py-2 text-xs leading-relaxed">
            {quote.message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            {quote.offers_form_e && (
              <Badge variant="success">✓ Form E</Badge>
            )}
            {quote.offers_form_rcep && (
              <Badge variant="success">✓ Form RCEP</Badge>
            )}
            {quote.certifications.slice(0, 4).map((c) => (
              <Badge key={c} variant="outline" className="text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/marketplace/suppliers/${quote.supplier_id}`}>
                <Package className="h-3.5 w-3.5" />
                ดูโปรไฟล์
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled>
              <MessageSquare className="h-3.5 w-3.5" />
              ตอบกลับ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          accent ?? "text-foreground"
        )}
      >
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

function formatThaiDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatThaiDateTime(iso: string): string {
  return new Date(iso).toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "ไม่ถึงชั่วโมง";
  if (hours < 24) return `${hours} ชม.`;
  const days = Math.floor(hours / 24);
  return `${days} วัน`;
}
