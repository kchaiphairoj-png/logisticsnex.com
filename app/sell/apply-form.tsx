"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Award,
  AlertCircle,
  CheckCircle2,
  Send,
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  submitSupplierApplication,
  type ApplyState,
} from "@/lib/actions/sell";

/** HS Chapter pickers — keep the list short for first impression. */
const CATEGORIES = [
  { code: "85", label: "Electronics" },
  { code: "84", label: "Machinery" },
  { code: "8504", label: "Power / Solar Inverter" },
  { code: "8507", label: "Batteries" },
  { code: "61", label: "Knit Garments" },
  { code: "62", label: "Woven Apparel" },
  { code: "63", label: "Home Textiles" },
  { code: "33", label: "Cosmetics" },
  { code: "34", label: "Personal Care" },
  { code: "94", label: "Furniture & Lighting" },
  { code: "73", label: "Hardware (Steel)" },
  { code: "76", label: "Hardware (Aluminum)" },
  { code: "87", label: "Auto Parts" },
  { code: "30", label: "Pharma & Healthcare" },
  { code: "09", label: "Spices & Tea" },
  { code: "20", label: "Processed Food" },
  { code: "21", label: "Beverages & Sauce" },
  { code: "23", label: "Animal Feed / Pet Food" },
  { code: "48", label: "Packaging / Paper" },
  { code: "39", label: "Plastics" },
];

const COUNTRIES = [
  { code: "CN", label: "🇨🇳 China" },
  { code: "VN", label: "🇻🇳 Vietnam" },
  { code: "KR", label: "🇰🇷 South Korea" },
  { code: "JP", label: "🇯🇵 Japan" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "ID", label: "🇮🇩 Indonesia" },
  { code: "MY", label: "🇲🇾 Malaysia" },
  { code: "PH", label: "🇵🇭 Philippines" },
  { code: "TW", label: "🇹🇼 Taiwan" },
  { code: "DE", label: "🇩🇪 Germany" },
  { code: "TR", label: "🇹🇷 Turkey" },
  { code: "PK", label: "🇵🇰 Pakistan" },
  { code: "BD", label: "🇧🇩 Bangladesh" },
  { code: "US", label: "🇺🇸 USA" },
];

export function ApplyForm() {
  const [state, formAction] = useFormState<ApplyState | undefined, FormData>(
    submitSupplierApplication,
    undefined
  );
  const [country, setCountry] = React.useState("CN");
  const [selectedCats, setSelectedCats] = React.useState<string[]>([]);
  const [forms, setForms] = React.useState({
    e: true,
    d: false,
    aj: false,
    ak: false,
    rcep: true,
  });

  const toggleCat = (code: string) =>
    setSelectedCats((p) =>
      p.includes(code) ? p.filter((x) => x !== code) : [...p, code]
    );

  /* ─── Success state ────────────────────────────────────────── */
  if (state?.ok) {
    return (
      <Card className="mx-auto max-w-2xl border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              ส่งใบสมัครสำเร็จ!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ทีมเราจะตรวจสอบใบสมัครภายใน 2-3 วันทำการ
              <br />
              เมื่อ verify เสร็จ — listing ของคุณจะขึ้นใน marketplace ทันที
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Application ID:{" "}
              <span className="font-mono text-foreground">
                {state.supplier_id?.slice(0, 8)}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-left">
            <p className="text-sm font-medium">📩 ขั้นต่อไป</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>· ทีมจะส่งอีเมลขอเอกสาร (ใบทะเบียน + อ้างอิง)</li>
              <li>· เตรียมรูปสินค้า + spec sheet</li>
              <li>· หลัง verify — บัญชี admin panel จะเปิดให้ใช้</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─── Form ─────────────────────────────────────────────────── */
  const fieldErr = (k: string) => state?.fieldErrors?.[k];

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-5">
      {/* Hidden serializations */}
      <input
        type="hidden"
        name="main_categories"
        value={selectedCats.join(",")}
      />
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="supports_form_e" value={String(forms.e)} />
      <input type="hidden" name="supports_form_d" value={String(forms.d)} />
      <input type="hidden" name="supports_form_aj" value={String(forms.aj)} />
      <input type="hidden" name="supports_form_ak" value={String(forms.ak)} />
      <input
        type="hidden"
        name="supports_form_rcep"
        value={String(forms.rcep)}
      />

      {/* Top-level error */}
      {state?.ok === false && state.message && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <p className="text-rose-400">{state.message}</p>
        </div>
      )}

      {/* Company info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            ข้อมูลบริษัท
          </CardTitle>
          <CardDescription>
            ข้อมูลที่จะแสดงในหน้าโปรไฟล์ — ตรวจสอบความถูกต้อง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ชื่อทางการ (Legal name)" required error={fieldErr("legal_name")}>
              <Input name="legal_name" placeholder="深圳市 XX 科技有限公司" />
            </Field>
            <Field label="ชื่อแบรนด์ (Trade name)" required error={fieldErr("trade_name")}>
              <Input name="trade_name" placeholder="Shenzhen XX Tech" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ประเทศ" required error={fieldErr("country")}>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="เมือง" required error={fieldErr("city")}>
              <Input name="city" placeholder="Shenzhen" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ปีก่อตั้ง" required error={fieldErr("established_year")}>
              <Input
                name="established_year"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                placeholder="2015"
              />
            </Field>
            <Field label="จำนวนพนักงาน" error={fieldErr("staff_count")}>
              <Input
                name="staff_count"
                type="number"
                min={1}
                placeholder="120"
              />
            </Field>
          </div>

          <Field
            label="รายละเอียดบริษัท + สินค้าที่ผลิต"
            required
            hint="อย่างน้อย 50 ตัวอักษร — ทำ-ขายอะไร, ตลาดหลัก, ลูกค้าใหญ่"
            error={fieldErr("description")}
          >
            <Textarea
              name="description"
              rows={4}
              placeholder="ตัวอย่าง: ผลิต LiFePO4 battery สำหรับ solar storage system ตั้งแต่ปี 2018 ส่งออกไปไทย+ASEAN +30 ลูกค้า ใช้ปี/2024 ส่งออก $5M ออก Form E ให้ลูกค้าไทยฟรี"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            หมวดสินค้าหลัก
          </CardTitle>
          <CardDescription>เลือกได้หลายอัน (อย่างน้อย 1)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selectedCats.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleCat(c.code)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-all",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {active && "✓ "}
                  {c.label}{" "}
                  <span className="text-[10px] opacity-60">({c.code})</span>
                </button>
              );
            })}
          </div>
          {fieldErr("main_categories") && (
            <p className="mt-2 text-xs text-rose-400">
              {fieldErr("main_categories")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* FTA support */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-emerald-400" />
            FTA / Certificate of Origin ที่ออกให้ได้
          </CardTitle>
          <CardDescription>
            ออกเองได้ + ส่ง original มาให้ลูกค้าไทย — ช่วยลดอากรขาเข้า
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ToggleRow
            title="Form E (ACFTA — China → Thailand)"
            desc="ลดอากรเหลือ 0-5% ส่วนใหญ่"
            checked={forms.e}
            onChange={(v) => setForms((p) => ({ ...p, e: v }))}
          />
          <ToggleRow
            title="Form RCEP"
            desc="ทุกชาติ RCEP (CN/JP/KR/AU/NZ/ASEAN)"
            checked={forms.rcep}
            onChange={(v) => setForms((p) => ({ ...p, rcep: v }))}
          />
          <ToggleRow
            title="Form D (ATIGA — ASEAN-internal)"
            desc="VN/ID/MY/PH/SG → TH"
            checked={forms.d}
            onChange={(v) => setForms((p) => ({ ...p, d: v }))}
          />
          <ToggleRow
            title="Form AJ (AJCEP — Japan)"
            desc="JP → TH"
            checked={forms.aj}
            onChange={(v) => setForms((p) => ({ ...p, aj: v }))}
          />
          <ToggleRow
            title="Form AK (AKFTA — Korea)"
            desc="KR → TH"
            checked={forms.ak}
            onChange={(v) => setForms((p) => ({ ...p, ak: v }))}
          />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" />
            ข้อมูลติดต่อ
          </CardTitle>
          <CardDescription>
            ทีมเราใช้ติดต่อยืนยันใบสมัคร — ไม่เผยแพร่สู่สาธารณะ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ชื่อผู้ติดต่อ" required error={fieldErr("contact_name")}>
              <Input
                name="contact_name"
                placeholder="Amy Chen / Lily Wang / etc."
              />
            </Field>
            <Field label="อีเมล" required error={fieldErr("email")}>
              <Input
                name="email"
                type="email"
                placeholder="sales@company.com"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="WhatsApp / โทรศัพท์"
              hint="optional"
              error={fieldErr("whatsapp")}
            >
              <Input name="whatsapp" placeholder="+86 138 0011 2233" />
            </Field>
            <Field
              label="WeChat ID"
              hint="optional, สำหรับ supplier จีน"
              error={fieldErr("wechat_id")}
            >
              <Input name="wechat_id" placeholder="company-wechat-id" />
            </Field>
          </div>

          <Field label="Website" hint="optional" error={fieldErr("website")}>
            <Input
              name="website"
              type="url"
              placeholder="https://www.company.com"
            />
          </Field>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit */}
      <div className="flex flex-col items-end gap-2">
        <SubmitButton disabled={selectedCats.length === 0} />
        {selectedCats.length === 0 && (
          <p className="text-[11px] text-amber-400">
            เลือกหมวดสินค้าอย่างน้อย 1 หมวด
          </p>
        )}
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          การส่งใบสมัครหมายความว่าคุณยอมรับ{" "}
          <a className="text-primary hover:underline">เงื่อนไขสำหรับ Supplier</a> และ{" "}
          <a className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>
        </p>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || disabled}
      className={cn(disabled && "cursor-not-allowed opacity-50")}
    >
      <Send className="h-4 w-4" />
      {pending ? "กำลังส่ง..." : "ส่งใบสมัคร"}
    </Button>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-400">*</span>}
        {hint && (
          <span className="text-[10px] font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
