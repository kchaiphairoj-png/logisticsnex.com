"use client";
import * as React from "react";
import {
  Eye,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MoreHorizontal,
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

type Status = "reading" | "success" | "review";

type Row = {
  id: string;
  docNo: string;
  type: string;
  supplier: string;
  amount: number;
  hsCount: number;
  status: Status;
  updatedAt: string;
};

const rows: Row[] = [
  {
    id: "DOC-2025-04122",
    docNo: "INV-SHZ-04122",
    type: "Invoice",
    supplier: "Shenzhen Tech Co., Ltd.",
    amount: 184_500,
    hsCount: 8,
    status: "success",
    updatedAt: "5 นาทีที่แล้ว",
  },
  {
    id: "DOC-2025-04121",
    docNo: "PL-SHZ-04122",
    type: "Packing List",
    supplier: "Shenzhen Tech Co., Ltd.",
    amount: 184_500,
    hsCount: 8,
    status: "reading",
    updatedAt: "8 นาทีที่แล้ว",
  },
  {
    id: "DOC-2025-04120",
    docNo: "INV-TYO-09918",
    type: "Invoice",
    supplier: "Tokyo Precision K.K.",
    amount: 472_800,
    hsCount: 14,
    status: "review",
    updatedAt: "32 นาทีที่แล้ว",
  },
  {
    id: "DOC-2025-04119",
    docNo: "INV-HCM-77203",
    type: "Invoice",
    supplier: "Saigon Garment JSC",
    amount: 96_240,
    hsCount: 5,
    status: "success",
    updatedAt: "1 ชม. ที่แล้ว",
  },
  {
    id: "DOC-2025-04118",
    docNo: "BL-MAERSK-2210",
    type: "B/L",
    supplier: "Maersk Logistics",
    amount: 0,
    hsCount: 0,
    status: "review",
    updatedAt: "2 ชม. ที่แล้ว",
  },
];

const statusConfig: Record<
  Status,
  { label: string; variant: "info" | "success" | "warning"; Icon: React.ComponentType<{ className?: string }> }
> = {
  reading: { label: "กำลังอ่านไฟล์", variant: "info", Icon: Loader2 },
  success: { label: "สำเร็จ", variant: "success", Icon: CheckCircle2 },
  review: { label: "รอมนุษย์ตรวจ", variant: "warning", Icon: AlertTriangle },
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>เอกสารล่าสุด</CardTitle>
          <CardDescription>
            รายการเอกสาร 5 รายการล่าสุดที่ระบบกำลังประมวลผล
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          ดูทั้งหมด
        </Button>
      </CardHeader>
      <CardContent className="p-0">
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
              const cfg = statusConfig[r.status];
              const Icon = cfg.Icon;
              return (
                <TableRow key={r.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{r.docNo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.type} · {r.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{r.supplier}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.amount > 0 ? (
                      <span className="font-medium">{formatTHB(r.amount)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.hsCount > 0 ? (
                      <Badge variant="outline" className="font-mono">
                        {r.hsCount}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant}>
                      <Icon
                        className={
                          r.status === "reading"
                            ? "h-3 w-3 animate-spin"
                            : "h-3 w-3"
                        }
                      />
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {r.updatedAt}
                    </p>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3.5 w-3.5" />
                        ดูรายละเอียด
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
      </CardContent>
    </Card>
  );
}
