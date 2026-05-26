"use client";
import * as React from "react";
import { CreditCard, QrCode, Building, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Method = "card" | "promptpay" | "bank";

export function PaymentForm() {
  const [method, setMethod] = React.useState<Method>("card");

  const methods: { value: Method; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "card", label: "บัตรเครดิต / เดบิต", sub: "Visa, Mastercard, JCB", icon: CreditCard },
    { value: "promptpay", label: "พร้อมเพย์", sub: "QR Code", icon: QrCode },
    { value: "bank", label: "โอนผ่านธนาคาร", sub: "Internet Banking", icon: Building },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">วิธีการชำระเงิน</h2>
        <p className="text-sm text-muted-foreground">เลือกช่องทางที่สะดวก</p>
      </div>

      {/* Method selector */}
      <div className="grid gap-2 sm:grid-cols-3">
        {methods.map((m) => {
          const Icon = m.icon;
          const active = method === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md",
                  active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{m.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{m.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Method-specific content */}
      {method === "card" && (
        <Card className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="card-name">ชื่อบนบัตร</Label>
            <Input id="card-name" placeholder="PATIKORN THAVISUK" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-number">หมายเลขบัตร</Label>
            <div className="relative">
              <Input id="card-number" placeholder="1234 5678 9012 3456" className="pr-16" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground">
                VISA
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="card-exp">วันหมดอายุ</Label>
              <Input id="card-exp" placeholder="MM / YY" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input id="card-cvc" placeholder="•••" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            ข้อมูลบัตรเข้ารหัสด้วย PCI-DSS Level 1 ผ่าน Omise
          </div>
        </Card>
      )}

      {method === "promptpay" && (
        <Card className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="grid grid-cols-8 gap-0.5 rounded-lg bg-white p-4">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    Math.random() > 0.45 ? "bg-black" : "bg-white"
                  )}
                />
              ))}
            </div>
            <p className="mt-4 text-sm font-medium">สแกน QR เพื่อชำระเงิน</p>
            <p className="mt-1 text-xs text-muted-foreground">
              QR จะหมดอายุใน 14:59 นาที · เปิดแอปธนาคารและสแกน
            </p>
          </div>
        </Card>
      )}

      {method === "bank" && (
        <Card className="space-y-3 p-5">
          {[
            { name: "ธนาคารกสิกรไทย", acc: "012-3-45678-9", branch: "สีลม" },
            { name: "ธนาคารไทยพาณิชย์", acc: "987-6-54321-0", branch: "อโศก" },
          ].map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-3"
            >
              <div>
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">
                  เลขที่ {b.acc} · สาขา{b.branch}
                </p>
              </div>
              <button className="text-xs text-primary hover:underline">
                คัดลอก
              </button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            กรุณาแนบสลิปหลังโอนเงินภายใน 24 ชม.
          </p>
        </Card>
      )}

      {/* Billing address */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">ที่อยู่ใบกำกับภาษี</h3>
        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">ชื่อบริษัท / นิติบุคคล</Label>
              <Input id="company" placeholder="บจ. ตัวอย่าง อิมพอร์ต" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax">เลขประจำตัวผู้เสียภาษี</Label>
              <Input id="tax" placeholder="0-1234-56789-01-2" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">ที่อยู่</Label>
            <Input id="address" placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์" />
          </div>
        </Card>
      </div>
    </div>
  );
}
