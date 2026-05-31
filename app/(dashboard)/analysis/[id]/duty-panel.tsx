"use client";
import * as React from "react";
import {
  Calculator,
  Download,
  Send,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTHB } from "@/lib/utils";

export interface DutySummaryData {
  fob_usd: number;
  cif_thb: number;
  duty_avg_pct: number;
  duty_thb: number;
  local_tax_thb: number;
  duty_total_thb: number;
  vat_thb: number;
  grand_total_thb: number;
  item_count: number;
  low_conf_count: number;
  ready: boolean;        // true if status === 'done'
}

export function DutyPanel({ data }: { data: DutySummaryData }) {
  if (!data.ready) {
    return (
      <Card className="sticky top-20">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          <Calculator className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium">รอ AI วิเคราะห์เสร็จ</p>
          <p className="mt-1 text-xs">การคำนวณภาษีจะแสดงเมื่อ AI สกัดข้อมูลเสร็จ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-20 overflow-hidden">
      <div className="bg-gradient-to-br from-blue-500/10 via-card to-card px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Calculator className="h-3.5 w-3.5" />
          สรุปภาษีและอากรขาเข้า
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">
            {formatTHB(data.grand_total_thb)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          ยอดที่ต้องชำระต่อกรมศุลกากร (ประมาณการ)
        </p>
      </div>

      <CardContent className="space-y-4 p-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ราคา CIF
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">มูลค่าสินค้า (FOB)</span>
              <div className="text-right">
                <span className="tabular-nums">
                  {formatTHB(Math.round(data.fob_usd * 36))}
                </span>
                <div className="text-[11px] text-muted-foreground">
                  USD {data.fob_usd.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ค่าระวาง + ประกัน (ประมาณ 5%)</span>
              <span className="tabular-nums">
                {formatTHB(Math.round(data.cif_thb - data.fob_usd * 36))}
              </span>
            </div>
          </div>
          <Separator className="my-2.5" />
          <div className="flex items-center justify-between text-sm font-medium">
            <span>ราคาศุลกากร</span>
            <span className="tabular-nums">{formatTHB(data.cif_thb)}</span>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            อากรขาเข้า
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                อากร (เฉลี่ย {data.duty_avg_pct}%)
              </span>
              <span className="tabular-nums">{formatTHB(data.duty_thb)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ภาษีมหาดไทย (10% ของอากร)</span>
              <span className="tabular-nums">{formatTHB(data.local_tax_thb)}</span>
            </div>
          </div>
          <Separator className="my-2.5" />
          <div className="flex items-center justify-between text-sm font-medium">
            <span>รวมอากร</span>
            <span className="tabular-nums text-amber-400">
              {formatTHB(data.duty_total_thb)}
            </span>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ภาษีมูลค่าเพิ่ม
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">VAT 7% ของ (CIF + อากร)</span>
            <span className="tabular-nums">{formatTHB(data.vat_thb)}</span>
          </div>
        </div>

        <Separator />

        <div className="rounded-lg bg-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">ยอดรวมทั้งสิ้น</p>
              <p className="text-xl font-bold tabular-nums text-primary mt-0.5">
                {formatTHB(data.grand_total_thb)}
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-primary/60" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button className="w-full" disabled>
            <Send className="h-4 w-4" />
            ส่งยื่นใบขนสินค้า
          </Button>
          <Button variant="outline" className="w-full" disabled>
            <Download className="h-4 w-4" />
            ดาวน์โหลด Form 0307
          </Button>
        </div>

        {data.low_conf_count > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-amber-400">หมายเหตุ:</span> มี{" "}
              <span className="font-medium">{data.low_conf_count} รายการ</span> ที่ความมั่นใจ AI ต่ำกว่า 90% — แนะนำให้ตรวจสอบก่อนยื่น
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          * ตัวเลขทั้งหมดเป็นการประมาณการ — สำหรับยอดที่แม่นยำ ตรวจสอบกับ HS Code rate ที่กรมศุลกากรประกาศใช้
        </p>
      </CardContent>
    </Card>
  );
}
