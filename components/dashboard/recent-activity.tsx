import Link from "next/link";
import {
  Eye,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  XCircle,
  MoreHorizontal,
  Inbox,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { formatTHB } from "@/lib/utils";

type Status = "pending" | "processing" | "done" | "failed";

export interface RecentDocumentRow {
  id: string;
  doc_number: string | null;
  doc_type: string;
  supplier_name: string | null;
  total_amount: number | null;
  hs_codes_count: number;
  ocr_status: Status;
  updated_relative: string;
}

const statusConfig: Record<
  Status,
  { label: string; variant: "info" | "success" | "warning" | "danger"; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "รอประมวลผล", variant: "warning", Icon: AlertTriangle },
  processing: { label: "กำลังอ่านไฟล์", variant: "info", Icon: Loader2 },
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

export function RecentActivity({ rows }: { rows: RecentDocumentRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>เอกสารล่าสุด</CardTitle>
          <CardDescription>
            {rows.length > 0
              ? `รายการเอกสาร ${rows.length} รายการล่าสุดที่ระบบประมวลผล`
              : "ยังไม่มีเอกสาร — อัปโหลดเอกสารแรกของคุณได้ที่หน้าอัปโหลด"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/analysis">ดูทั้งหมด</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            ยังไม่มีเอกสารในระบบ
            <div className="mt-3">
              <Button asChild size="sm">
                <Link href="/upload">อัปโหลดเอกสารแรก</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">เอกสาร</TableHead>
                <TableHead>คู่ค้า / Supplier</TableHead>
                <TableHead className="text-right">มูลค่า</TableHead>
                <TableHead className="text-center">HS Codes</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>อัปเดต</TableHead>
                <TableHead className="pr-6 text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const cfg = statusConfig[r.ocr_status] ?? statusConfig.pending;
                const Icon = cfg.Icon;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{r.supplier_name ?? "—"}</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.total_amount && r.total_amount > 0 ? (
                        <span className="font-medium">{formatTHB(r.total_amount)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.hs_codes_count > 0 ? (
                        <Badge variant="outline" className="font-mono">
                          {r.hs_codes_count}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>
                        <Icon
                          className={
                            r.ocr_status === "processing"
                              ? "h-3 w-3 animate-spin"
                              : "h-3 w-3"
                          }
                        />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {r.updated_relative}
                      </p>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/analysis/${r.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            ดูรายละเอียด
                          </Link>
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
        )}
      </CardContent>
    </Card>
  );
}
