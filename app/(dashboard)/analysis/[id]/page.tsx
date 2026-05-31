import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  FileText,
  Sparkles,
  Package,
  TrendingUp,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getDocumentDetail, calcDutySummary } from "@/lib/queries/document-detail";
import { DetailTabs } from "./detail-tabs";
import { DutyPanel } from "./duty-panel";
import { RetryButton } from "./retry-button";
import { cn, formatTHB } from "@/lib/utils";

export default async function AnalysisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser(`/analysis/${params.id}`);
  const doc = await getDocumentDetail(params.id);

  if (!doc) return notFound();

  const duty = calcDutySummary(doc);
  const itemCount = doc.items.length;
  const avgConf =
    itemCount > 0
      ? doc.items.reduce((s, i) => s + (Number(i.hs_confidence) || 0), 0) / itemCount
      : 0;
  const lowConf = doc.items.filter(
    (i) => Number(i.hs_confidence ?? 0) > 0 && Number(i.hs_confidence) < 0.9
  ).length;

  const statusBadge: Record<typeof doc.ocr_status, { label: string; variant: "info" | "success" | "warning" | "danger" }> = {
    pending: { label: "รอประมวลผล", variant: "warning" },
    processing: { label: "กำลังประมวลผล", variant: "info" },
    done: { label: lowConf > 0 ? "รอตรวจสอบ" : "สำเร็จ", variant: lowConf > 0 ? "warning" : "success" },
    failed: { label: "ผิดพลาด", variant: "danger" },
  };

  const docMeta = [
    {
      label: "เลขที่ Invoice",
      value: doc.doc_number ?? "—",
    },
    {
      label: "วันที่เอกสาร",
      value: doc.issue_date
        ? new Date(doc.issue_date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
    {
      label: "Supplier",
      value: doc.supplier_name ?? "—",
    },
    {
      label: "ประเทศต้นทาง",
      value: doc.origin_country ?? "—",
    },
    {
      label: "Incoterm",
      value: doc.incoterm ?? "—",
    },
    {
      label: "สกุลเงิน",
      value: doc.currency ?? "USD",
    },
    {
      label: "ประเภทเอกสาร",
      value: doc.doc_type,
    },
    {
      label: "อัปโหลดเมื่อ",
      value: new Date(doc.created_at).toLocaleString("th-TH"),
    },
  ];

  const stats = [
    {
      label: "จำนวนรายการ",
      value: itemCount.toString(),
      sub: itemCount > 0 ? "สินค้าใน Invoice" : "ยังไม่มี",
      icon: Package,
      color: "text-sky-400",
      bg: "from-sky-500/20 to-sky-500/5",
    },
    {
      label: "ความมั่นใจ AI เฉลี่ย",
      value: avgConf > 0 ? `${(avgConf * 100).toFixed(1)}%` : "—",
      sub:
        lowConf > 0 ? `${lowConf} รายการต่ำกว่าเกณฑ์` : "ทุกรายการมั่นใจสูง",
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      label: "มูลค่ารวม (THB)",
      value: doc.ocr_status === "done" ? formatTHB(duty.cif_thb) : "—",
      sub: doc.ocr_status === "done" ? `USD ${duty.fob_usd.toFixed(2)}` : "รอวิเคราะห์",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "from-amber-500/20 to-amber-500/5",
    },
    {
      label: "อากร + VAT",
      value:
        doc.ocr_status === "done" ? formatTHB(duty.grand_total_thb) : "—",
      sub:
        doc.ocr_status === "done"
          ? `${((duty.grand_total_thb / Math.max(1, duty.cif_thb)) * 100).toFixed(1)}% ของ CIF`
          : "—",
      icon: AlertCircle,
      color: "text-rose-400",
      bg: "from-rose-500/20 to-rose-500/5",
    },
  ];

  const cfg = statusBadge[doc.ocr_status];

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
        <span className="text-foreground truncate max-w-[200px]">
          {doc.doc_number ?? doc.id.slice(0, 8)}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30">
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {doc.doc_number ?? "(ไม่ระบุเลขเอกสาร)"}
              </h1>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {doc.supplier_name ?? "Supplier ไม่ระบุ"} ·{" "}
              {new Date(doc.created_at).toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RetryButton documentId={doc.id} status={doc.ocr_status} />
          {doc.signed_file_url && (
            <Button size="sm" asChild>
              <a href={doc.signed_file_url} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5" />
                ดูเอกสารต้นฉบับ
              </a>
            </Button>
          )}
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
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-current/20",
                    s.bg,
                    s.color
                  )}
                >
                  <Icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold tabular-nums mt-0.5">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailTabs doc={doc} docMeta={docMeta} />
        </div>

        <div className="lg:col-span-1">
          <DutyPanel
            data={{
              ...duty,
              item_count: itemCount,
              low_conf_count: lowConf,
              ready: doc.ocr_status === "done" && itemCount > 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
