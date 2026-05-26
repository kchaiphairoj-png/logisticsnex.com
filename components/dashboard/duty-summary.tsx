"use client";
import * as React from "react";
import {
  Calculator,
  Download,
  Send,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTHB } from "@/lib/utils";

const breakdown = [
  { label: "มูลค่าสินค้า (FOB)", value: 649_260, sub: "USD 18,035" },
  { label: "ค่าระวาง (Freight)", value: 28_000 },
  { label: "ค่าประกัน (Insurance)", value: 6_200 },
];

const customsValue = 683_460;

const duties = [
  { label: "อากรขาเข้า (เฉลี่ย 7.8%)", value: 53_310, rate: "7.80%" },
  { label: "ภาษีสรรพสามิต", value: 0, rate: "—" },
  { label: "ภาษีมหาดไทย (10% ของอากร)", value: 5_331, rate: "10%" },
];

const dutyTotal = 58_641;
const vatBase = customsValue + dutyTotal;
const vat = Math.round(vatBase * 0.07);
const grandTotal = dutyTotal + vat;

export function DutySummary() {
  return (
    <div className="space-y-4">
      {/* Main summary */}
      <Card className="sticky top-20 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500/10 via-card to-card px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Calculator className="h-3.5 w-3.5" />
            สรุปภาษีและอากรขาเข้า
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {formatTHB(grandTotal)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ยอดที่ต้องชำระต่อกรมศุลกากร
          </p>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Customs value */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ราคา CIF
            </p>
            <div className="space-y-1.5">
              {breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{b.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="tabular-nums">{formatTHB(b.value)}</span>
                    {b.sub && (
                      <div className="text-[11px] text-muted-foreground">
                        {b.sub}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-2.5" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>ราคาศุลกากร</span>
              <span className="tabular-nums">{formatTHB(customsValue)}</span>
            </div>
          </div>

          <Separator />

          {/* Duties */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              อากรขาเข้า
            </p>
            <div className="space-y-1.5">
              {duties.map((d) => (
                <div key={d.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="tabular-nums">
                    {d.value > 0 ? formatTHB(d.value) : "—"}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-2.5" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>รวมอากร</span>
              <span className="tabular-nums text-amber-400">
                {formatTHB(dutyTotal)}
              </span>
            </div>
          </div>

          <Separator />

          {/* VAT */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ภาษีมูลค่าเพิ่ม
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">VAT 7% ของ (CIF + อากร)</span>
              <span className="tabular-nums">{formatTHB(vat)}</span>
            </div>
          </div>

          <Separator />

          {/* Grand total */}
          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ยอดรวมทั้งสิ้น</p>
                <p className="text-xl font-bold tabular-nums text-primary mt-0.5">
                  {formatTHB(grandTotal)}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-primary/60" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button className="w-full">
              <Send className="h-4 w-4" />
              ส่งยื่นใบขนสินค้า
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4" />
              ดาวน์โหลด Form 0307
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-amber-400">หมายเหตุ:</span> มี{" "}
              <span className="font-medium">2 รายการ</span> ที่ความมั่นใจ AI ต่ำกว่า 90% แนะนำให้ผู้เชี่ยวชาญตรวจสอบก่อนยื่น
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
