import {
  FileClock,
  Coins,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatTHB, cn } from "@/lib/utils";

export interface SummaryCardsData {
  pending_docs: number;
  needs_review: number;
  delta_pending: number;        // change vs yesterday
  tax_total_thb: number;        // tax calculated this month
  docs_count: number;           // total docs this month
  tax_delta_pct: number;        // % change vs last month
  ai_credits_left: number;
  ai_credits_total: number;
  ai_credits_reset_days: number;
}

export function SummaryCards({ data }: { data: SummaryCardsData }) {
  const cards = [
    {
      key: "pending",
      label: "เอกสารรอนุมัติ",
      value: data.pending_docs.toString(),
      delta: data.delta_pending
        ? {
            value: `${data.delta_pending > 0 ? "+" : ""}${data.delta_pending} จากเมื่อวาน`,
            positive: data.delta_pending < 0, // fewer pending = positive
          }
        : null,
      icon: FileClock,
      accent: "text-amber-400",
      iconBg: "from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/20",
      footer:
        data.needs_review > 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {data.needs_review} เอกสารต้องตรวจมนุษย์
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">ไม่มีเอกสารค้างตรวจ</div>
        ),
    },
    {
      key: "tax",
      label: "ภาษีคำนวณเดือนนี้",
      value: formatTHB(data.tax_total_thb),
      delta:
        data.tax_delta_pct !== 0
          ? {
              value: `${data.tax_delta_pct > 0 ? "+" : ""}${data.tax_delta_pct.toFixed(1)}% เทียบเดือนก่อน`,
              positive: data.tax_delta_pct > 0,
            }
          : null,
      icon: Coins,
      accent: "text-emerald-400",
      iconBg: "from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-500/20",
      footer: (
        <div className="text-xs text-muted-foreground">
          จาก <span className="font-medium text-foreground">{data.docs_count}</span> เอกสาร · เดือนนี้
        </div>
      ),
    },
    {
      key: "credit",
      label: "เครดิต AI คงเหลือ",
      value: data.ai_credits_left.toLocaleString(),
      delta: {
        value: `ของ ${data.ai_credits_total.toLocaleString()} เครดิต`,
        positive: true,
      },
      icon: Sparkles,
      accent: "text-sky-400",
      iconBg: "from-sky-500/20 to-sky-500/5 ring-1 ring-sky-500/20",
      footer: (
        <div className="space-y-1.5">
          <Progress
            value={(data.ai_credits_left / Math.max(1, data.ai_credits_total)) * 100}
            indicatorClassName="bg-gradient-to-r from-sky-400 to-blue-500"
          />
          <p className="text-xs text-muted-foreground">รีเซ็ตใน {data.ai_credits_reset_days} วัน</p>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.key}
            className="relative overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{c.value}</p>
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
                    c.iconBg
                  )}
                >
                  <Icon className={cn("h-5 w-5", c.accent)} />
                </div>
              </div>

              {c.delta && (
                <div className="mt-3 flex items-center gap-1 text-xs">
                  {c.delta.positive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      c.delta.positive ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {c.delta.value}
                  </span>
                </div>
              )}

              <div className="mt-4 border-t border-border pt-3">{c.footer}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
