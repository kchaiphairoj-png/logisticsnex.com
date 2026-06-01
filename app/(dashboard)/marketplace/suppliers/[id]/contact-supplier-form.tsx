"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { sendInquiry, type SendInquiryState } from "@/lib/actions/inquiries";
import { cn } from "@/lib/utils";

interface Props {
  supplierId: string;
  supplierName: string;
}

export function ContactSupplierForm({ supplierId, supplierName }: Props) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useFormState<
    SendInquiryState | undefined,
    FormData
  >(sendInquiry, undefined);

  /* ─── Success state ────────────────────────────────────────── */
  if (state?.ok) {
    return (
      <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <CardContent className="space-y-3 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold">ส่งข้อความสำเร็จ!</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              ทีม LogisticsNex จะติดต่อ {supplierName} แทนคุณ และจะแจ้งคำตอบกลับมาภายใน 24-48 ชม.
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-left">
            <p className="text-xs font-medium">ติดตามสถานะได้ที่:</p>
            <Link
              href="/marketplace/inquiries"
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <MessageSquare className="h-3 w-3" />
              ข้อความของฉัน → ID:{" "}
              <span className="font-mono">{state.inquiry_id?.slice(0, 8)}</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─── Collapsed CTA ────────────────────────────────────────── */
  if (!open) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-blue-500/5 via-card to-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                ติดต่อ {supplierName} ผ่าน LogisticsNex
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                ส่งคำถาม / ขอข้อมูลเพิ่มเติม — ทีมเรารีเลย์ภายใน 24-48 ชม.
              </p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} size="lg">
            <Send className="h-4 w-4" />
            เขียนข้อความ
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ─── Form ─────────────────────────────────────────────────── */
  const fieldErr = (k: string) => state?.fieldErrors?.[k];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              ส่งข้อความถึง {supplierName}
            </CardTitle>
            <CardDescription className="mt-1">
              ทีม LogisticsNex จะรีเลย์ + แจ้งคำตอบกลับมาให้
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <ChevronUp className="h-4 w-4" />
            ย่อ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="supplier_id" value={supplierId} />

          {state?.ok === false && state.message && (
            <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5 text-xs">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
              <p className="text-rose-400">{state.message}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="subject">
              หัวข้อ <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder='เช่น "สนใจ inverter 5kW ขอใบเสนอราคา"'
            />
            {fieldErr("subject") && (
              <p className="text-xs text-rose-400">{fieldErr("subject")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">
              ข้อความ <span className="text-rose-400">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              placeholder="อธิบายความต้องการ — สเปก, ปริมาณ, การส่ง, Form E ที่ต้องการ ..."
            />
            {fieldErr("message") && (
              <p className="text-xs text-rose-400">{fieldErr("message")}</p>
            )}
          </div>

          <Separator />

          <p className="text-xs font-medium text-muted-foreground">
            ข้อมูลคำสั่งซื้อ (ไม่บังคับ — ช่วยให้ supplier เสนอราคาแม่นกว่า)
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="quantity">ปริมาณ</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                placeholder="50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity_unit">หน่วย</Label>
              <Select id="quantity_unit" name="quantity_unit" defaultValue="pcs">
                <option value="pcs">pcs</option>
                <option value="set">set</option>
                <option value="kg">kg</option>
                <option value="ctn">carton</option>
                <option value="ctr">container</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="target_price_usd">ราคาเป้า (USD/หน่วย)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="target_price_usd"
                  name="target_price_usd"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  placeholder="800.00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="needed_by_date">ต้องการรับของภายใน</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="needed_by_date"
                  name="needed_by_date"
                  type="date"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              ทีม LogisticsNex จะรีเลย์ข้อความนี้ในชื่อของคุณภายใน 24-48 ชม.
              <br />
              ข้อมูลของคุณจะไม่แสดงสู่สาธารณะ
            </p>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="shrink-0">
      <Send className="h-4 w-4" />
      {pending ? "กำลังส่ง..." : "ส่งข้อความ"}
    </Button>
  );
}
