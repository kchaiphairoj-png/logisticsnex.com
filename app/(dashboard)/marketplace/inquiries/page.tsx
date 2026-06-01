/**
 * /marketplace/inquiries — buyer's inquiry inbox
 *
 * Lists every inquiry the user's org has sent through "Contact Supplier".
 * Status badges reflect where the inquiry is in the relay pipeline.
 */
import Link from "next/link";
import {
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Inbox,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getInquiriesForOrg,
  type InquiryListItem,
} from "@/lib/queries/marketplace";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  InquiryListItem["status"],
  { label: string; tone: "amber" | "sky" | "blue" | "emerald" | "muted" }
> = {
  pending: { label: "รอ LogisticsNex รับเรื่อง", tone: "amber" },
  in_review: { label: "กำลังตรวจสอบ", tone: "sky" },
  forwarded: { label: "ส่งให้ supplier แล้ว", tone: "blue" },
  responded: { label: "Supplier ตอบกลับแล้ว", tone: "emerald" },
  closed: { label: "ปิดแล้ว", tone: "muted" },
};

const TONE: Record<
  "amber" | "sky" | "blue" | "emerald" | "muted",
  string
> = {
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  muted: "border-border bg-secondary text-muted-foreground",
};

export default async function InquiriesListPage() {
  const user = await requireUser("/marketplace/inquiries");
  const inquiries = await getInquiriesForOrg(user.default_org_id);

  const responded = inquiries.filter((i) => i.status === "responded").length;
  const pending = inquiries.filter((i) =>
    ["pending", "in_review", "forwarded"].includes(i.status)
  ).length;

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
        <span className="text-foreground">ข้อความของฉัน</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ข้อความของฉัน</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ทุก inquiry ที่ส่งไปยัง supplier — ทีม LogisticsNex รีเลย์ให้
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace">
            <Send className="h-4 w-4" />
            ค้นหา supplier
          </Link>
        </Button>
      </div>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Inbox}
          label="ทั้งหมด"
          value={inquiries.length}
          tone="muted"
        />
        <StatCard
          icon={Clock}
          label="กำลังดำเนินการ"
          value={pending}
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="มีคำตอบจาก supplier"
          value={responded}
          tone="emerald"
        />
      </div>

      {/* List */}
      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="text-base font-semibold">ยังไม่มี inquiry</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              เปิดโปรไฟล์ supplier แล้วคลิก "เขียนข้อความ" — ทีมเราจะรีเลย์ให้คุณ
            </p>
            <Button asChild variant="outline">
              <Link href="/marketplace">เริ่มค้นหา supplier</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <InquiryRow key={inq.id} inquiry={inq} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Subcomponents
 * ──────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "amber" | "sky" | "blue" | "emerald" | "muted";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            TONE[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InquiryRow({ inquiry }: { inquiry: InquiryListItem }) {
  const meta = STATUS_META[inquiry.status];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
              {inquiry.supplier_country_flag}
            </div>
            <div>
              <CardTitle className="text-base">{inquiry.subject}</CardTitle>
              <CardDescription className="mt-0.5">
                ส่งถึง{" "}
                <Link
                  href={`/marketplace/suppliers/${inquiry.supplier_id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {inquiry.supplier_trade_name}
                </Link>{" "}
                · {formatRelative(inquiry.created_at)}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={TONE[meta.tone]}>
            {meta.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2">
          {inquiry.message}
        </p>

        {(inquiry.quantity ||
          inquiry.target_price_usd ||
          inquiry.needed_by_date) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {inquiry.quantity && (
              <span>
                ปริมาณ:{" "}
                <b className="text-foreground">
                  {inquiry.quantity.toLocaleString()} {inquiry.quantity_unit}
                </b>
              </span>
            )}
            {inquiry.target_price_usd && (
              <span>
                ราคาเป้า:{" "}
                <b className="text-foreground">
                  ${inquiry.target_price_usd}/{inquiry.quantity_unit}
                </b>
              </span>
            )}
            {inquiry.needed_by_date && (
              <span>
                ต้องการภายใน:{" "}
                <b className="text-foreground">
                  {formatThaiDate(inquiry.needed_by_date)}
                </b>
              </span>
            )}
          </div>
        )}

        {inquiry.admin_note && (
          <div className="rounded-md border border-sky-500/20 bg-sky-500/5 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
              📋 จาก LogisticsNex
            </p>
            <p className="mt-1 text-xs leading-relaxed">{inquiry.admin_note}</p>
          </div>
        )}

        {inquiry.supplier_response && (
          <>
            <Separator />
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                คำตอบจาก {inquiry.supplier_trade_name}
                {inquiry.responded_at && (
                  <span className="text-muted-foreground normal-case">
                    · {formatRelative(inquiry.responded_at)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                {inquiry.supplier_response}
              </p>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button asChild variant="outline" size="sm">
            <Link href={`/marketplace/suppliers/${inquiry.supplier_id}`}>
              ดูโปรไฟล์
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม. ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatThaiDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
