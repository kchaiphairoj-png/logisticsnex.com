"use client";
import * as React from "react";
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

type Card = {
  key: string;
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  iconBg: string;
  footer?: React.ReactNode;
};

export function SummaryCards() {
  const cards: Card[] = [
    {
      key: "pending",
      label: "เอกสารรอนุมัติ",
      value: "12",
      delta: { value: "+3 จากเมื่อวาน", positive: false },
      icon: FileClock,
      accent: "text-amber-400",
      iconBg: "from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/20",
      footer: (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          5 เอกสารต้องตรวจมนุษย์
        </div>
      ),
    },
    {
      key: "tax",
      label: "ภาษีคำนวณเดือนนี้",
      value: formatTHB(2_847_500),
      delta: { value: "+18.2% เทียบเดือนก่อน", positive: true },
      icon: Coins,
      accent: "text-emerald-400",
      iconBg: "from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-500/20",
      footer: (
        <div className="text-xs text-muted-foreground">
          จาก <span className="font-medium text-foreground">87</span> เอกสาร · พ.ค. 2568
        </div>
      ),
    },
    {
      key: "credit",
      label: "เครดิต AI คงเหลือ",
      value: "742",
      delta: { value: "ของ 1,000 เครดิต", positive: true },
      icon: Sparkles,
      accent: "text-sky-400",
      iconBg: "from-sky-500/20 to-sky-500/5 ring-1 ring-sky-500/20",
      footer: (
        <div className="space-y-1.5">
          <Progress value={74.2} indicatorClassName="bg-gradient-to-r from-sky-400 to-blue-500" />
          <p className="text-xs text-muted-foreground">รีเซ็ตใน 12 วัน</p>
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
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {c.value}
                  </p>
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
