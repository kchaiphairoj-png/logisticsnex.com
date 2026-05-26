"use client";
import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn, formatTHB } from "@/lib/utils";

type Status = "success" | "reading" | "review" | "failed";

type Row = {
  id: string;
  docNo: string;
  type: "Invoice" | "Packing List" | "B/L";
  supplier: string;
  origin: string;
  itemCount: number;
  avgConfidence: number;
  totalValue: number;
  totalTax: number;
  status: Status;
  date: string;
};

const rows: Row[] = [
  { id: "DOC-2025-04122", docNo: "INV-SHZ-04122", type: "Invoice", supplier: "Shenzhen Tech Co., Ltd.", origin: "🇨🇳 จีน", itemCount: 8, avgConfidence: 0.873, totalValue: 649_260, totalTax: 110_483, status: "review", date: "26 พ.ค. 2568" },
  { id: "DOC-2025-04121", docNo: "PL-SHZ-04122", type: "Packing List", supplier: "Shenzhen Tech Co., Ltd.", origin: "🇨🇳 จีน", itemCount: 8, avgConfidence: 0.92, totalValue: 649_260, totalTax: 0, status: "success", date: "26 พ.ค. 2568" },
  { id: "DOC-2025-04120", docNo: "INV-TYO-09918", type: "Invoice", supplier: "Tokyo Precision K.K.", origin: "🇯🇵 ญี่ปุ่น", itemCount: 14, avgConfidence: 0.71, totalValue: 1_842_300, totalTax: 248_710, status: "review", date: "25 พ.ค. 2568" },
  { id: "DOC-2025-04119", docNo: "INV-HCM-77203", type: "Invoice", supplier: "Saigon Garment JSC", origin: "🇻🇳 เวียดนาม", itemCount: 5, avgConfidence: 0.95, totalValue: 96_240, totalTax: 11_549, status: "success", date: "25 พ.ค. 2568" },
  { id: "DOC-2025-04118", docNo: "BL-MAERSK-2210", type: "B/L", supplier: "Maersk Logistics", origin: "🇩🇰 เดนมาร์ก", itemCount: 0, avgConfidence: 0, totalValue: 0, totalTax: 0, status: "reading", date: "25 พ.ค. 2568" },
  { id: "DOC-2025-04117", docNo: "INV-SEL-55104", type: "Invoice", supplier: "Seoul Components Inc.", origin: "🇰🇷 เกาหลีใต้", itemCount: 22, avgConfidence: 0.88, totalValue: 2_437_400, totalTax: 365_610, status: "success", date: "24 พ.ค. 2568" },
  { id: "DOC-2025-04116", docNo: "INV-DEL-33891", type: "Invoice", supplier: "Mumbai Textile Ltd.", origin: "🇮🇳 อินเดีย", itemCount: 11, avgConfidence: 0.79, totalValue: 482_900, totalTax: 67_606, status: "review", date: "24 พ.ค. 2568" },
  { id: "DOC-2025-04115", docNo: "INV-FRA-12047", type: "Invoice", supplier: "Frankfurt Auto Parts GmbH", origin: "🇩🇪 เยอรมนี", itemCount: 6, avgConfidence: 0.41, totalValue: 1_204_750, totalTax: 0, status: "failed", date: "23 พ.ค. 2568" },
  { id: "DOC-2025-04114", docNo: "INV-SHZ-04098", type: "Invoice", supplier: "Shenzhen Tech Co., Ltd.", origin: "🇨🇳 จีน", itemCount: 9, avgConfidence: 0.94, totalValue: 738_100, totalTax: 125_477, status: "success", date: "22 พ.ค. 2568" },
  { id: "DOC-2025-04113", docNo: "INV-OSA-66201", type: "Invoice", supplier: "Osaka Industrial Co.", origin: "🇯🇵 ญี่ปุ่น", itemCount: 17, avgConfidence: 0.91, totalValue: 1_572_900, totalTax: 235_935, status: "success", date: "22 พ.ค. 2568" },
];

const statusConfig: Record<Status, { label: string; variant: "info" | "success" | "warning" | "danger"; Icon: React.ComponentType<{ className?: string }> }> = {
  reading: { label: "กำลังอ่านไฟล์", variant: "info", Icon: Loader2 },
  success: { label: "สำเร็จ", variant: "success", Icon: CheckCircle2 },
  review: { label: "รอตรวจ", variant: "warning", Icon: AlertTriangle },
  failed: { label: "ผิดพลาด", variant: "danger", Icon: XCircle },
};

const summaryStats = [
  { label: "เอกสารทั้งหมด", value: "287", sub: "+18 ในสัปดาห์นี้" },
  { label: "สำเร็จ", value: "234", sub: "81.5%", color: "text-emerald-400" },
  { label: "รอตรวจ", value: "39", sub: "13.6%", color: "text-amber-400" },
  { label: "มูลค่ารวม", value: formatTHB(28_472_500), sub: "พ.ค. 2568" },
];

export default function AnalysisListPage() {
  const [statusFilter, setStatusFilter] = React.useState<Status | "all">("all");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (query && !`${r.docNo} ${r.supplier}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ประวัติภาษี & HS Code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ผลการวิเคราะห์เอกสารทั้งหมดที่ AI ประมวลผล
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" asChild>
            <Link href="/upload">
              <Sparkles className="h-3.5 w-3.5" />
              วิเคราะห์เอกสารใหม่
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", s.color)}>
                {s.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>รายการเอกสาร</CardTitle>
              <CardDescription>
                แสดง {filtered.length} จาก {rows.length} รายการ
              </CardDescription>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเลขเอกสาร, supplier..."
                className="pl-9 h-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
              className="h-9 w-40"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="success">สำเร็จ</option>
              <option value="review">รอตรวจ</option>
              <option value="reading">กำลังอ่าน</option>
              <option value="failed">ผิดพลาด</option>
            </Select>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="h-3.5 w-3.5" />
              ช่วงวันที่
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-3.5 w-3.5" />
              ตัวกรองเพิ่มเติม
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">
                  <div className="flex items-center gap-1">
                    เลขเอกสาร <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Supplier / ต้นทาง</TableHead>
                <TableHead className="text-center">รายการ</TableHead>
                <TableHead>ความมั่นใจ AI</TableHead>
                <TableHead className="text-right">มูลค่ารวม</TableHead>
                <TableHead className="text-right">ภาษี+อากร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead className="pr-6 text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r) => {
                const cfg = statusConfig[r.status];
                const Icon = cfg.Icon;
                const confColor =
                  r.avgConfidence >= 0.9
                    ? "text-emerald-400"
                    : r.avgConfidence >= 0.75
                    ? "text-amber-400"
                    : r.avgConfidence > 0
                    ? "text-rose-400"
                    : "text-muted-foreground";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6">
                      <Link
                        href={`/analysis/${r.id}`}
                        className="flex items-center gap-3 hover:text-primary"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{r.docNo}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.type} · {r.id}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{r.supplier}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.origin}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      {r.itemCount > 0 ? (
                        <Badge variant="outline">{r.itemCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.avgConfidence > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full",
                                r.avgConfidence >= 0.9 ? "bg-emerald-500" : r.avgConfidence >= 0.75 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${r.avgConfidence * 100}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-semibold tabular-nums", confColor)}>
                            {(r.avgConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.totalValue > 0 ? formatTHB(r.totalValue) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.totalTax > 0 ? (
                        <span className="text-amber-400">{formatTHB(r.totalTax)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>
                        <Icon className={r.status === "reading" ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{r.date}</span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/analysis/${r.id}`}>ดู</Link>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              หน้า <span className="font-medium text-foreground">{page}</span> จาก{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                ก่อนหน้า
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
