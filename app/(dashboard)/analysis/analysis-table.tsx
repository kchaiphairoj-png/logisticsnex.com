"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import type {
  DocumentListItem,
  DocumentStatus,
} from "@/lib/queries/documents";

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "info" | "success" | "warning" | "danger"; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "รอประมวลผล", variant: "warning", Icon: AlertTriangle },
  processing: { label: "กำลังอ่าน", variant: "info", Icon: Loader2 },
  done: { label: "สำเร็จ", variant: "success", Icon: CheckCircle2 },
  failed: { label: "ผิดพลาด", variant: "danger", Icon: XCircle },
};

const docTypeLabel: Record<string, string> = {
  invoice: "Invoice",
  packing_list: "Packing List",
  bl: "B/L",
  awb: "AWB",
  other: "Other",
};

export function AnalysisTable({
  items,
  total,
  page,
  totalPages,
  initialStatus,
  initialQuery,
}: {
  items: DocumentListItem[];
  total: number;
  page: number;
  totalPages: number;
  initialStatus: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState(initialQuery);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    // Reset to page 1 when filter changes
    if (key !== "page") next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", query || null);
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>รายการเอกสาร</CardTitle>
            <CardDescription>แสดง {items.length} จาก {total} รายการ</CardDescription>
          </div>
        </div>

        {/* Filter bar */}
        <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
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
            value={initialStatus}
            onChange={(e) => setParam("status", e.target.value === "all" ? null : e.target.value)}
            className="h-9 w-40"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="done">สำเร็จ</option>
            <option value="processing">กำลังอ่าน</option>
            <option value="pending">รอประมวลผล</option>
            <option value="failed">ผิดพลาด</option>
          </Select>
          <Button type="submit" variant="outline" size="sm" className="h-9">
            <Search className="h-3.5 w-3.5" />
            ค้นหา
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-9" disabled>
            <Calendar className="h-3.5 w-3.5" />
            ช่วงวันที่
          </Button>
        </form>
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="font-medium text-foreground">ยังไม่มีเอกสาร</p>
            <p className="mt-1">
              {initialQuery || initialStatus !== "all"
                ? "ลองเปลี่ยน filter หรือล้างคำค้นหา"
                : "เริ่มต้นโดยอัปโหลด Invoice เอกสารแรกของคุณ"}
            </p>
            {!initialQuery && initialStatus === "all" && (
              <Button asChild size="sm" className="mt-4">
                <Link href="/upload">อัปโหลดเอกสาร</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
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
                {items.map((r) => {
                  const cfg = statusConfig[r.ocr_status] ?? statusConfig.pending;
                  const Icon = cfg.Icon;
                  const conf = r.avg_confidence;
                  const confColor =
                    conf >= 0.9
                      ? "text-emerald-400"
                      : conf >= 0.75
                      ? "text-amber-400"
                      : conf > 0
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
                            <p className="font-medium leading-tight">
                              {r.doc_number ?? "(ไม่ระบุเลขเอกสาร)"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {docTypeLabel[r.doc_type] ?? r.doc_type} · {r.id.slice(0, 8)}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{r.supplier_name ?? "—"}</p>
                        {r.origin_country && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.origin_country}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.item_count > 0 ? (
                          <Badge variant="outline">{r.item_count}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {conf > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={cn(
                                  "h-full",
                                  conf >= 0.9
                                    ? "bg-emerald-500"
                                    : conf >= 0.75
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                )}
                                style={{ width: `${conf * 100}%` }}
                              />
                            </div>
                            <span className={cn("text-xs font-semibold tabular-nums", confColor)}>
                              {(conf * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.total_value_thb > 0 ? (
                          formatTHB(r.total_value_thb)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.total_tax_thb > 0 ? (
                          <span className="text-amber-400">{formatTHB(r.total_tax_thb)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>
                          <Icon className={r.ocr_status === "processing" ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("th-TH", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
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

            {totalPages > 1 && (
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
                    onClick={() => setParam("page", String(Math.max(1, page - 1)))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    ก่อนหน้า
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setParam("page", String(Math.min(totalPages, page + 1)))}
                  >
                    ถัดไป
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
