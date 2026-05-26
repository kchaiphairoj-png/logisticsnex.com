"use client";
import * as React from "react";
import {
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatTHB } from "@/lib/utils";

type Alt = { code: string; conf: number };

export type LineItem = {
  id: string;
  lineNo: number;
  description: string;
  descriptionTh: string;
  qty: number;
  unit: string;
  unitPriceUsd: number;
  amountUsd: number;
  amountThb: number;
  hsCode: string;
  hsConfidence: number;
  dutyRate: number;
  vatRate: number;
  reasoning: string;
  alternatives: Alt[];
  verified: boolean;
};

const items: LineItem[] = [
  {
    id: "1",
    lineNo: 1,
    description: "Industrial Grade Lithium-Ion Battery Pack 48V 100Ah",
    descriptionTh: "ชุดแบตเตอรี่ลิเธียมไอออน 48V 100Ah เกรดอุตสาหกรรม",
    qty: 20,
    unit: "PCS",
    unitPriceUsd: 380,
    amountUsd: 7600,
    amountThb: 273_600,
    hsCode: "8507.60.00.000",
    hsConfidence: 0.96,
    dutyRate: 5,
    vatRate: 7,
    reasoning:
      "ระบุชัดเจนว่าเป็นแบตเตอรี่ลิเธียมไอออนตามคำอธิบาย ใช้ในยานยนต์/อุตสาหกรรม ตรงกับพิกัด 8507.60 (Lithium-ion accumulators)",
    alternatives: [
      { code: "8507.80.00.000", conf: 0.42 },
      { code: "8506.50.00.000", conf: 0.28 },
    ],
    verified: true,
  },
  {
    id: "2",
    lineNo: 2,
    description: "Solar Charge Controller MPPT 60A 12/24/48V",
    descriptionTh: "เครื่องควบคุมการชาร์จพลังงานแสงอาทิตย์ MPPT 60A",
    qty: 15,
    unit: "PCS",
    unitPriceUsd: 145,
    amountUsd: 2175,
    amountThb: 78_300,
    hsCode: "8504.40.30.000",
    hsConfidence: 0.91,
    dutyRate: 10,
    vatRate: 7,
    reasoning:
      "เป็นอุปกรณ์ Static Converter สำหรับโซลาร์ จัดอยู่ในกลุ่ม 8504.40 (Static converters) เฉพาะเจาะจง static converters อื่นๆ",
    alternatives: [
      { code: "8504.40.90.000", conf: 0.55 },
      { code: "8541.40.10.000", conf: 0.18 },
    ],
    verified: false,
  },
  {
    id: "3",
    lineNo: 3,
    description: "Hybrid Inverter 5kW Pure Sine Wave",
    descriptionTh: "อินเวอร์เตอร์ไฮบริด 5kW คลื่นไซน์บริสุทธิ์",
    qty: 8,
    unit: "PCS",
    unitPriceUsd: 920,
    amountUsd: 7360,
    amountThb: 264_960,
    hsCode: "8504.40.90.000",
    hsConfidence: 0.74,
    dutyRate: 10,
    vatRate: 7,
    reasoning:
      "Inverter เป็น Static Converter แต่ AI ไม่แน่ใจระหว่าง 8504.40.30 และ 8504.40.90 — แนะนำมนุษย์ตรวจ",
    alternatives: [
      { code: "8504.40.30.000", conf: 0.62 },
      { code: "8541.43.00.000", conf: 0.14 },
    ],
    verified: false,
  },
  {
    id: "4",
    lineNo: 4,
    description: "Mounting Brackets Aluminum (Set of 4)",
    descriptionTh: "ขายึดอลูมิเนียม (ชุด 4 ชิ้น)",
    qty: 50,
    unit: "SET",
    unitPriceUsd: 18,
    amountUsd: 900,
    amountThb: 32_400,
    hsCode: "7616.99.90.000",
    hsConfidence: 0.88,
    dutyRate: 10,
    vatRate: 7,
    reasoning:
      "ของใช้ทำด้วยอลูมิเนียม ไม่ระบุประเภทเฉพาะเจาะจง จัดอยู่ในกลุ่ม Other articles of aluminium",
    alternatives: [{ code: "7610.90.90.000", conf: 0.31 }],
    verified: true,
  },
];

export function LineItemsList() {
  const [expanded, setExpanded] = React.useState<string | null>("3");

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>รายการสินค้า & พิกัดศุลกากร</CardTitle>
          <CardDescription>
            ผลการวิเคราะห์ HS Code โดย AI · {items.length} รายการ · ความมั่นใจเฉลี่ย{" "}
            <span className="font-medium text-emerald-400">87.3%</span>
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Sparkles className="h-3.5 w-3.5" />
          วิเคราะห์ใหม่
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            isOpen={expanded === item.id}
            onToggle={() =>
              setExpanded((cur) => (cur === item.id ? null : item.id))
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ItemRow({
  item,
  isOpen,
  onToggle,
}: {
  item: LineItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const confColor =
    item.hsConfidence >= 0.9
      ? "text-emerald-400"
      : item.hsConfidence >= 0.75
      ? "text-amber-400"
      : "text-rose-400";

  const confBar =
    item.hsConfidence >= 0.9
      ? "from-emerald-400 to-emerald-500"
      : item.hsConfidence >= 0.75
      ? "from-amber-400 to-amber-500"
      : "from-rose-400 to-rose-500";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all",
        isOpen ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"
      )}
    >
      {/* Row header */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
          {item.lineNo.toString().padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.descriptionTh}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium tabular-nums">
                {formatTHB(item.amountThb)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ${item.amountUsd.toLocaleString()} · {item.qty} {item.unit}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              {item.hsCode}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", confBar)}
                  style={{ width: `${item.hsConfidence * 100}%` }}
                />
              </div>
              <span className={cn("text-xs font-semibold tabular-nums", confColor)}>
                {(item.hsConfidence * 100).toFixed(1)}%
              </span>
            </div>
            {item.verified ? (
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" /> ยืนยันแล้ว
              </Badge>
            ) : (
              <Badge variant="warning">
                <AlertTriangle className="h-3 w-3" /> รอตรวจ
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              อากร {item.dutyRate}% · VAT {item.vatRate}%
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180 text-primary"
              )}
            />
          </div>
        </div>
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <>
          <Separator />
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  เหตุผลของ AI
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {item.reasoning}
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-xs text-muted-foreground">
                  เคยใช้รหัสนี้กับ supplier เดียวกัน{" "}
                  <span className="font-medium text-foreground">14 ครั้ง</span> ใน 6 เดือนที่ผ่านมา
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                รหัสทางเลือก
              </h4>
              <div className="space-y-2">
                {item.alternatives.map((alt) => (
                  <div
                    key={alt.code}
                    className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2 hover:bg-secondary/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {alt.code}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ความน่าจะเป็น {(alt.conf * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7">
                      เลือก
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit3 className="h-3.5 w-3.5" />
                  แก้ไขด้วยตนเอง
                </Button>
                {!item.verified && (
                  <Button size="sm" className="flex-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    ยืนยันรหัสนี้
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
