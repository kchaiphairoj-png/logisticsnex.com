/**
 * /marketplace/suppliers/[id] — Server Component
 *
 * Fetches the supplier dossier + product catalog + reviews from Supabase.
 * Public-read tables (suppliers, supplier_products) — no auth required.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ShieldCheck,
  Star,
  MessageSquare,
  Send,
  MapPin,
  Calendar,
  Users,
  Factory,
  Award,
  CheckCircle2,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Building2,
  Lock,
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
import { ProductCard } from "@/components/marketplace/supplier-card";
import {
  getSupplierById,
  getSupplierProducts,
  getSupplierReviews,
} from "@/lib/queries/marketplace";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SupplierProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supplier = await getSupplierById(params.id);
  if (!supplier) return notFound();

  const [products, reviews] = await Promise.all([
    getSupplierProducts(supplier.id, 30),
    getSupplierReviews(supplier.id, 20),
  ]);

  // Aggregate certifications across the supplier's products (DB stores them
  // at the product level — display the union here).
  const certifications = Array.from(
    new Set(products.flatMap((p) => p.certifications))
  ).sort();

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
        <span className="text-foreground truncate">{supplier.trade_name}</span>
      </nav>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border">
        <div className="relative h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 lg:h-40">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {supplier.is_verified && (
              <Badge className="bg-emerald-500 text-white border-0">
                <ShieldCheck className="h-3 w-3" />
                Verified {supplier.verified_by ?? ""}
              </Badge>
            )}
            {supplier.trade_assurance && (
              <Badge className="bg-amber-500 text-white border-0">
                <Lock className="h-3 w-3" />
                Trade Assurance
              </Badge>
            )}
          </div>
        </div>

        <div className="relative px-6 pb-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-10">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card text-4xl ring-4 ring-background">
                {supplier.country_flag}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {supplier.trade_name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {supplier.legal_name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {supplier.city ?? "—"}, {supplier.country}
                  </span>
                  {supplier.established_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> ก่อตั้ง {supplier.established_year}
                    </span>
                  )}
                  {supplier.staff_count && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {supplier.staff_count} คน
                    </span>
                  )}
                  {supplier.factory_size_sqm && (
                    <span className="flex items-center gap-1">
                      <Factory className="h-3 w-3" />{" "}
                      {supplier.factory_size_sqm.toLocaleString()} ตร.ม.
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4" />
                ส่งข้อความ
              </Button>
              <Button asChild>
                <Link href={`/marketplace/rfq/new?supplier=${supplier.id}`}>
                  <Send className="h-4 w-4" />
                  ส่ง RFQ
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-4 border-t border-border pt-5">
            <Stat
              icon={Star}
              value={supplier.rating > 0 ? supplier.rating.toFixed(1) : "—"}
              label={`${supplier.review_count} รีวิว`}
              hint="คะแนนจากผู้ซื้อจริง"
              accent="text-amber-400"
            />
            <Stat
              icon={MessageSquare}
              value={
                supplier.response_rate
                  ? `${Number(supplier.response_rate).toFixed(0)}%`
                  : "—"
              }
              label={
                supplier.response_hours_avg
                  ? `ตอบใน ${supplier.response_hours_avg} ชม.`
                  : "—"
              }
              hint="อัตราการตอบกลับ"
              accent="text-blue-400"
            />
            <Stat
              icon={CheckCircle2}
              value={
                supplier.on_time_delivery_rate
                  ? `${supplier.on_time_delivery_rate.toFixed(0)}%`
                  : "—"
              }
              label="ส่งตรงเวลา"
              hint="6 เดือนล่าสุด"
              accent="text-emerald-400"
            />
            <Stat
              icon={TrendingUp}
              value={
                supplier.export_volume_usd_yearly > 0
                  ? `$${(supplier.export_volume_usd_yearly / 1_000_000).toFixed(1)}M`
                  : "—"
              }
              label="ส่งออกต่อปี"
              hint="self-declared"
              accent="text-sky-400"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
              <TabsTrigger value="products">สินค้า ({products.length})</TabsTrigger>
              <TabsTrigger value="reviews">รีวิว ({reviews.length})</TabsTrigger>
              <TabsTrigger value="certifications">
                การรับรอง ({certifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>เกี่ยวกับ {supplier.trade_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="หมวดสินค้าหลัก">
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.main_categories.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          supplier.main_categories.map((c) => (
                            <Badge
                              key={c.hs_chapter}
                              variant="outline"
                              className="text-xs"
                            >
                              {c.name} ({c.hs_chapter})
                            </Badge>
                          ))
                        )}
                      </div>
                    </InfoRow>
                    <InfoRow label="ตลาดหลัก">
                      <p className="text-sm">
                        {supplier.main_markets.length > 0
                          ? supplier.main_markets.join(" · ")
                          : "—"}
                      </p>
                    </InfoRow>
                    <InfoRow label="ท่าเรือต้นทาง">
                      <p className="text-sm">{supplier.ships_from_port ?? "—"}</p>
                    </InfoRow>
                    <InfoRow label="ระยะเวลาส่งถึงไทย">
                      <p className="text-sm font-medium">
                        {supplier.ships_to_thailand_days_min > 0
                          ? `${supplier.ships_to_thailand_days_min}–${supplier.ships_to_thailand_days_max} วัน (CIF Bangkok)`
                          : "—"}
                      </p>
                    </InfoRow>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-400" />
                    FTA / Form ที่ supplier ออกให้ได้
                  </CardTitle>
                  <CardDescription>
                    ใช้ลดอากรขาเข้าได้ — supplier ต้องส่ง original certificate
                    มาให้ก่อน customs clearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <FtaRow
                    label="Form E (ACFTA)"
                    desc="China → Thailand · ลดอากรเหลือ 0–5% ส่วนใหญ่"
                    supported={supplier.supports_form_e}
                  />
                  <FtaRow
                    label="Form RCEP"
                    desc="ใช้แทน Form E ได้ถ้า supplier มี certificate"
                    supported={supplier.supports_form_rcep}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center text-sm text-muted-foreground">
                    ยังไม่มีสินค้าใน catalog
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      supplier={supplier}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>รีวิวจากผู้ซื้อจริง</CardTitle>
                    <CardDescription>
                      เฉพาะ buyer ที่มีคำสั่งซื้อยืนยันแล้วเท่านั้น
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">
                      {supplier.rating > 0 ? supplier.rating.toFixed(1) : "—"}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i <= Math.round(supplier.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      ยังไม่มีรีวิว
                    </p>
                  ) : (
                    reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-border bg-secondary/30 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar fallback={getInitials(r.org_name)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {r.org_name ?? "ลูกค้านิรนาม"}
                                </p>
                                {r.verified_purchase && (
                                  <Badge variant="success" className="h-5">
                                    <CheckCircle2 className="h-3 w-3" />
                                    ซื้อจริง
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatRelative(r.created_at)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i <= r.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                            {r.title && (
                              <p className="mt-2 text-sm font-medium">{r.title}</p>
                            )}
                            {r.body && (
                              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                                {r.body}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                              {r.quality_rating != null && (
                                <span>
                                  คุณภาพ:{" "}
                                  <b className="text-foreground">
                                    {r.quality_rating}/5
                                  </b>
                                </span>
                              )}
                              {r.communication_rating != null && (
                                <span>
                                  การสื่อสาร:{" "}
                                  <b className="text-foreground">
                                    {r.communication_rating}/5
                                  </b>
                                </span>
                              )}
                              {r.delivery_rating != null && (
                                <span>
                                  การส่ง:{" "}
                                  <b className="text-foreground">
                                    {r.delivery_rating}/5
                                  </b>
                                </span>
                              )}
                              {r.would_reorder && (
                                <span className="text-emerald-400">✓ จะสั่งซ้ำ</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications">
              <Card>
                <CardHeader>
                  <CardTitle>ใบรับรองและมาตรฐาน</CardTitle>
                  <CardDescription>
                    รวมจากสินค้าทุกชิ้นใน catalog (
                    {certifications.length} รายการ)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certifications.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      ยังไม่มีข้อมูลการรับรอง
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((cert) => (
                        <Badge
                          key={cert}
                          variant="outline"
                          className="font-mono text-xs px-3 py-1"
                        >
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ติดต่อ supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/marketplace/rfq/new?supplier=${supplier.id}`}>
                  <Send className="h-4 w-4" />
                  ส่ง RFQ
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4" />
                เริ่ม chat
              </Button>

              <Separator />

              {supplier.wechat_id && (
                <ContactRow
                  icon={Phone}
                  label="WeChat"
                  value={supplier.wechat_id}
                  hint="วิธีติดต่อหลักของ supplier จีน"
                />
              )}
              {supplier.whatsapp && (
                <ContactRow
                  icon={Phone}
                  label="WhatsApp"
                  value={supplier.whatsapp}
                />
              )}
              {supplier.email && (
                <ContactRow icon={Mail} label="Email" value={supplier.email} />
              )}
              {supplier.website && (
                <ContactRow
                  icon={Globe}
                  label="Website"
                  value={supplier.website}
                />
              )}

              <Separator />

              {supplier.trade_assurance && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <p className="text-xs font-medium text-amber-400">
                      Trade Assurance
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    เงินค้างใน escrow จนสินค้าตรวจรับเรียบร้อย — ป้องกันการสแกม
                    หรือสินค้าไม่ตรงสเปก
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ข้อมูลธุรกิจ
                </p>
              </div>
              <dl className="space-y-2 text-sm">
                <KV k="ชื่อทางการ" v={supplier.legal_name} />
                <KV
                  k="ประเทศ"
                  v={`${supplier.country_flag} ${supplier.country}`}
                />
                {supplier.established_year && (
                  <KV
                    k="ก่อตั้ง"
                    v={`${supplier.established_year} (${
                      new Date().getFullYear() - supplier.established_year
                    } ปี)`}
                  />
                )}
                {supplier.staff_count && (
                  <KV k="พนักงาน" v={`${supplier.staff_count} คน`} />
                )}
                {supplier.factory_size_sqm && (
                  <KV
                    k="พื้นที่โรงงาน"
                    v={`${supplier.factory_size_sqm.toLocaleString()} ตร.ม.`}
                  />
                )}
                {supplier.business_license_no && (
                  <KV k="License" v={supplier.business_license_no} />
                )}
              </dl>
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

function Stat({
  icon: Icon,
  value,
  label,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  hint: string;
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", accent)} />
        <p className="text-lg font-bold tabular-nums">{value}</p>
      </div>
      <p className="text-xs text-foreground mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function FtaRow({
  label,
  desc,
  supported,
}: {
  label: string;
  desc: string;
  supported: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md",
          supported
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {supported ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <span className="text-xs">—</span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {supported ? (
        <Badge variant="success">รองรับ</Badge>
      ) : (
        <Badge variant="outline">ไม่รองรับ</Badge>
      )}
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-1" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{value}</p>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-xs font-medium text-right truncate">{v}</dd>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "วันนี้";
  if (days < 7) return `${days} วันที่แล้ว`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
  if (days < 365) return `${Math.floor(days / 30)} เดือนที่แล้ว`;
  return `${Math.floor(days / 365)} ปีที่แล้ว`;
}
