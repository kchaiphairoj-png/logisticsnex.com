"use client";
import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  Tag,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  PlanSelector,
  plans,
  type Cycle,
} from "@/components/dashboard/plan-selector";
import { PaymentForm } from "@/components/dashboard/payment-form";
import { formatTHB } from "@/lib/utils";

const VAT_RATE = 0.07;

export default function BillingPage() {
  const [selected, setSelected] = React.useState("pro");
  const [cycle, setCycle] = React.useState<Cycle>("yearly");
  const [coupon, setCoupon] = React.useState("");
  const [discount, setDiscount] = React.useState(0);

  const plan = plans.find((p) => p.code === selected)!;
  const subtotal = cycle === "monthly" ? plan.monthly : plan.yearly;
  const couponAmount = discount;
  const beforeVat = subtotal - couponAmount;
  const vat = Math.round(beforeVat * VAT_RATE);
  const total = beforeVat + vat;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "WELCOME10") {
      setDiscount(Math.round(subtotal * 0.1));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">ชำระเงิน & แพ็กเกจ</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">อัปเกรดแพ็กเกจ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ปลดล็อกศักยภาพ AI สำหรับธุรกิจนำเข้า-ส่งออกของคุณ
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-muted-foreground">
            ปลอดภัยด้วย <span className="font-medium text-foreground">SSL 256-bit</span> · ผ่าน <span className="font-medium text-foreground">Omise</span>
          </span>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: plan + payment form */}
        <div className="space-y-6 lg:col-span-2">
          <PlanSelector
            selected={selected}
            onSelect={setSelected}
            cycle={cycle}
            onCycleChange={setCycle}
          />
          <Separator />
          <PaymentForm />
        </div>

        {/* Right: order summary (sticky) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 overflow-hidden">
            {/* Header */}
            <div className="border-b border-border bg-gradient-to-br from-blue-500/10 via-card to-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                สรุปคำสั่งซื้อ
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">
                  {plan.name} Plan
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {plan.tagline} · {cycle === "monthly" ? "รายเดือน" : "รายปี"}
              </p>
            </div>

            <div className="space-y-4 p-5">
              {/* Coupon */}
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> โค้ดส่วนลด
                </label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    placeholder="ใส่โค้ด (ลอง WELCOME10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={applyCoupon}>
                    ใช้
                  </Button>
                </div>
                {discount > 0 && (
                  <p className="mt-1.5 text-xs text-emerald-400">
                    ✓ ใช้โค้ด WELCOME10 — ลด 10%
                  </p>
                )}
              </div>

              <Separator />

              {/* Line items */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {plan.name} ({cycle === "monthly" ? "1 เดือน" : "12 เดือน"})
                  </span>
                  <span className="tabular-nums">{formatTHB(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>ส่วนลด WELCOME10</span>
                    <span className="tabular-nums">-{formatTHB(couponAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">VAT 7%</span>
                  <span className="tabular-nums">{formatTHB(vat)}</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">ยอดรวมทั้งสิ้น</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">
                      {formatTHB(total)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {cycle === "yearly" ? "เก็บปีละครั้ง" : "เก็บทุกเดือน"} · ยกเลิกได้ทุกเมื่อ
                    </p>
                  </div>
                  <Lock className="h-7 w-7 text-primary/60" />
                </div>
              </div>

              <Button className="w-full" size="lg">
                <Lock className="h-4 w-4" />
                ยืนยันชำระเงิน {formatTHB(total)}
              </Button>

              <div className="grid grid-cols-3 gap-2 text-center">
                <TrustItem label="SSL 256-bit" />
                <TrustItem label="PCI-DSS" />
                <TrustItem label="PDPA" />
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                การกดปุ่ม "ยืนยันชำระเงิน" หมายความว่าคุณยอมรับ{" "}
                <a className="text-primary hover:underline">เงื่อนไขการใช้งาน</a> และ{" "}
                <a className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2">
      <ShieldCheck className="mx-auto h-3.5 w-3.5 text-emerald-400" />
      <p className="mt-1 text-[10px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
