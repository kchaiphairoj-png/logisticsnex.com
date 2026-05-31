"use client";
import * as React from "react";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatTHB } from "@/lib/utils";
import type { PlanCard } from "@/lib/queries/billing";

export type Cycle = "monthly" | "yearly";

/**
 * Map a plan's code_root to its presentational metadata (icon, tagline,
 * "popular" badge, and the feature bullets we want to show on the card).
 *
 * The features in the DB are a JSONB of capabilities (team_seats, api_access...);
 * for marketing copy we still want a curated Thai bullet list, so we keep
 * one here keyed by code_root.
 */
const PLAN_PRESENTATION: Record<
  string,
  {
    tagline: string;
    icon: React.ComponentType<{ className?: string }>;
    popular?: boolean;
    bullets: (p: PlanCard) => string[];
  }
> = {
  starter: {
    tagline: "สำหรับ SME เริ่มต้น",
    icon: Sparkles,
    bullets: (p) => [
      `เอกสาร ${p.doc_quota.toLocaleString()} ฉบับ/เดือน`,
      `วิเคราะห์ HS Code ${p.hs_lookup_quota.toLocaleString()} ครั้ง`,
      `ผู้ใช้ ${p.features.team_seats ?? 2} คน`,
      "ส่งออก PDF / Excel",
      "Email support",
    ],
  },
  pro: {
    tagline: "ยอดนิยมสำหรับธุรกิจกลาง",
    icon: Zap,
    popular: true,
    bullets: (p) => [
      `เอกสาร ${p.doc_quota.toLocaleString()} ฉบับ/เดือน`,
      `วิเคราะห์ HS Code ${p.hs_lookup_quota.toLocaleString()} ครั้ง`,
      `ผู้ใช้ ${p.features.team_seats ?? 10} คน`,
      ...(p.features.api_access ? ["API Access + Webhook"] : []),
      "Audit logs 1 ปี",
      "Priority support",
    ],
  },
  ent: {
    tagline: "สำหรับองค์กรขนาดใหญ่",
    icon: Building2,
    bullets: (p) => [
      "เอกสารไม่จำกัด",
      "HS Code วิเคราะห์ไม่จำกัด",
      "ผู้ใช้ไม่จำกัด",
      "Dedicated server (TH region)",
      `SLA ${p.features.sla ?? "99.9%"} uptime`,
      "Custom integration",
      "Account manager",
    ],
  },
};

const DEFAULT_PRESENTATION = PLAN_PRESENTATION.pro;

export function PlanSelector({
  plans,
  selected,
  onSelect,
  cycle,
  onCycleChange,
}: {
  plans: PlanCard[];
  selected: string;        // plan card's code_root
  onSelect: (codeRoot: string) => void;
  cycle: Cycle;
  onCycleChange: (c: Cycle) => void;
}) {
  if (plans.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        ยังไม่มีแพ็กเกจในระบบ — ติดต่อทีมงานเพื่อสอบถาม
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">เลือกแพ็กเกจ</h2>
          <p className="text-sm text-muted-foreground">
            ปรับเปลี่ยนหรือยกเลิกได้ทุกเมื่อ
          </p>
        </div>
        {/* Cycle toggle */}
        <div className="inline-flex items-center rounded-lg border border-border bg-secondary p-0.5 text-sm">
          <button
            onClick={() => onCycleChange("monthly")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              cycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            รายเดือน
          </button>
          <button
            onClick={() => onCycleChange("yearly")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
              cycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            รายปี
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              -17%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const pres = PLAN_PRESENTATION[p.code_root] ?? DEFAULT_PRESENTATION;
          const Icon = pres.icon;
          const price =
            cycle === "monthly"
              ? p.monthly_price_thb
              : Math.round(p.yearly_price_thb / 12);
          const isSelected = selected === p.code_root;
          return (
            <Card
              key={p.code_root}
              onClick={() => onSelect(p.code_root)}
              className={cn(
                "relative cursor-pointer p-5 transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                  : "hover:border-primary/40"
              )}
            >
              {pres.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground border-0">
                    <Sparkles className="h-3 w-3" /> ยอดนิยม
                  </Badge>
                </div>
              )}

              {isSelected && (
                <div className="absolute right-3 top-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>

              <h3 className="mt-3 text-base font-semibold">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{pres.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums">
                  {formatTHB(price)}
                </span>
                <span className="text-xs text-muted-foreground">/ เดือน</span>
              </div>
              {cycle === "yearly" && (
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  เก็บปีละครั้ง {formatTHB(p.yearly_price_thb)}
                </p>
              )}

              <div className="my-4 h-px bg-border" />

              <ul className="space-y-2">
                {pres.bullets(p).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
