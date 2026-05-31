"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  ChevronRight,
  Send,
  Sparkles,
  Calendar,
  Globe,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  X,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createRfq, type CreateRfqState } from "@/lib/actions/marketplace";

const CERTS = [
  "CE",
  "FCC",
  "RoHS",
  "UN38.3",
  "FDA",
  "GMP",
  "ISO 9001",
  "IATF 16949",
  "OEKO-TEX",
];

const ORIGIN_OPTIONS = [
  { code: "CN", flag: "🇨🇳", name: "จีน" },
  { code: "VN", flag: "🇻🇳", name: "เวียดนาม" },
  { code: "KR", flag: "🇰🇷", name: "เกาหลี" },
  { code: "JP", flag: "🇯🇵", name: "ญี่ปุ่น" },
  { code: "IN", flag: "🇮🇳", name: "อินเดีย" },
  { code: "ID", flag: "🇮🇩", name: "อินโด" },
];

export default function NewRfqPage() {
  const sp = useSearchParams();
  const prefilledDesc = sp.get("desc") ?? "";
  const prefilledOrigin = sp.get("origin");
  const prefilledFormE = sp.get("form_e") === "1";

  const [step, setStep] = React.useState(1);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState(prefilledDesc);
  const [category, setCategory] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("pcs");
  const [targetPrice, setTargetPrice] = React.useState("");
  const [origin, setOrigin] = React.useState<string[]>(
    prefilledOrigin && prefilledOrigin !== "any" ? [prefilledOrigin] : ["CN"]
  );
  const [requireFormE, setRequireFormE] = React.useState<boolean>(
    prefilledFormE || true
  );
  const [incoterm, setIncoterm] = React.useState("CIF");
  const [port, setPort] = React.useState("THBKK");
  const [neededBy, setNeededBy] = React.useState("");
  const [sampleRequired, setSampleRequired] = React.useState(true);
  const [selectedCerts, setSelectedCerts] = React.useState<string[]>([]);

  const [state, formAction] = useFormState<
    CreateRfqState | undefined,
    FormData
  >(createRfq, undefined);

  const toggleCert = (c: string) =>
    setSelectedCerts((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const toggleOrigin = (c: string) =>
    setOrigin((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const canContinue =
    step === 1
      ? title.trim().length > 5 && description.trim().length > 20
      : step === 2
      ? quantity && Number(quantity) > 0
      : true;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/marketplace"
          className="hover:text-foreground transition-colors"
        >
          Marketplace
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">สร้าง RFQ ใหม่</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ส่ง RFQ ใหม่</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            โพสต์ความต้องการของคุณ — supplier ที่ตรงจะส่งใบเสนอราคาภายใน 24 ชม.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI ช่วยคำนวณ HS Code + ภาษีให้อัตโนมัติ
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { n: 1, label: "รายละเอียดสินค้า" },
          { n: 2, label: "ปริมาณ & งบประมาณ" },
          { n: 3, label: "เงื่อนไข & การส่ง" },
        ].map((s, i, arr) => (
          <React.Fragment key={s.n}>
            <button
              type="button"
              onClick={() => setStep(s.n)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                step === s.n
                  ? "border-primary bg-primary/10 text-primary"
                  : step > s.n
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                  : "border-border text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  step === s.n
                    ? "bg-primary text-primary-foreground"
                    : step > s.n
                    ? "bg-emerald-500 text-white"
                    : "bg-secondary"
                )}
              >
                {step > s.n ? "✓" : s.n}
              </span>
              {s.label}
            </button>
            {i < arr.length - 1 && <div className="h-px w-6 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Error banner */}
      {state?.ok === false && state.message && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-400 font-medium">{state.message}</p>
            {state.fieldErrors && (
              <ul className="mt-1 list-disc pl-4 text-xs text-rose-300">
                {Object.entries(state.fieldErrors).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form action={formAction} className="grid gap-6 lg:grid-cols-3">
        {/* Hidden state — sent with every submit */}
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="quantity" value={quantity} />
        <input type="hidden" name="quantity_unit" value={unit} />
        <input type="hidden" name="target_price_usd" value={targetPrice} />
        <input
          type="hidden"
          name="preferred_origin"
          value={origin.join(",")}
        />
        <input
          type="hidden"
          name="required_certifications"
          value={selectedCerts.join(",")}
        />
        <input
          type="hidden"
          name="required_form_e"
          value={String(requireFormE)}
        />
        <input type="hidden" name="delivery_incoterm" value={incoterm} />
        <input type="hidden" name="delivery_port" value={port} />
        <input type="hidden" name="needed_by_date" value={neededBy} />
        <input
          type="hidden"
          name="sample_required"
          value={String(sampleRequired)}
        />

        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดสินค้าที่ต้องการ</CardTitle>
                <CardDescription>
                  อธิบายให้ละเอียดที่สุด — supplier จะใช้ข้อมูลนี้เสนอราคาที่แม่นยำ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title-input">หัวข้อ RFQ</Label>
                  <Input
                    id="title-input"
                    placeholder='เช่น "Hybrid Solar Inverter 5kW + Form E"'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat">หมวดสินค้า</Label>
                  <Select
                    id="cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">— เลือกหมวด —</option>
                    <option value="energy">Solar / พลังงาน</option>
                    <option value="apparel">เสื้อผ้า / สิ่งทอ</option>
                    <option value="beauty">ความงาม / สกินแคร์</option>
                    <option value="home">ของใช้ในบ้าน</option>
                    <option value="auto">ชิ้นส่วนยานยนต์</option>
                    <option value="elec">อิเล็กทรอนิกส์</option>
                    <option value="other">อื่นๆ</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="desc">รายละเอียดและ specification</Label>
                  <Textarea
                    id="desc"
                    rows={5}
                    placeholder={`• Specification ที่ต้องการ (กำลังไฟ, ขนาด, สี, วัสดุ)
• Use case ที่จะใช้
• สเปกที่ต้อง match กับสินค้าเก่า`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    AI จะ analyze ข้อความนี้และแนะนำ HS Code อัตโนมัติ
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>ปริมาณและงบประมาณ</CardTitle>
                <CardDescription>
                  ระบุปริมาณ + ราคาเป้าหมาย เพื่อให้ supplier filter ตัวเองออก
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="qty">ปริมาณ</Label>
                    <Input
                      id="qty"
                      type="number"
                      placeholder="50"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="unit">หน่วย</Label>
                    <Select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
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
                    <Label htmlFor="target">ราคาเป้าหมาย / unit (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="target"
                        type="number"
                        placeholder="800.00"
                        className="pl-7"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="needed">ต้องการรับของภายใน</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="needed"
                        type="date"
                        className="pl-9"
                        value={neededBy}
                        onChange={(e) => setNeededBy(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>ประเทศต้นทางที่รับได้ (เลือกได้หลายอัน)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ORIGIN_OPTIONS.map((c) => {
                      const active = origin.includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => toggleOrigin(c.code)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-accent"
                          )}
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                          {active && <X className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>เงื่อนไขการส่งและการรับรอง</CardTitle>
                <CardDescription>
                  Form E และ certification ช่วย filter supplier ที่ทำงานเรื่องนี้ได้จริง
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ic">Incoterm</Label>
                    <Select
                      id="ic"
                      value={incoterm}
                      onChange={(e) => setIncoterm(e.target.value)}
                    >
                      {["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"].map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="port">ท่าเรือ/สนามบินปลายทาง</Label>
                    <Select
                      id="port"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                    >
                      <option value="THBKK">Bangkok (THBKK)</option>
                      <option value="THLCH">Laem Chabang (THLCH)</option>
                      <option value="THBKK-AIR">Suvarnabhumi (THBKK)</option>
                      <option value="THCNX">Chiang Mai (THCNX)</option>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <ToggleRow
                    title="ต้องการ Form E (China origin)"
                    desc="ใช้ลดอากร 5-20% สำหรับสินค้าจีน — แนะนำ"
                    checked={requireFormE}
                    onChange={setRequireFormE}
                  />
                  <ToggleRow
                    title="ต้องการตัวอย่างก่อนสั่งจริง"
                    desc="Supplier ส่งตัวอย่างฟรี/คิดค่า sample ก่อน MOQ"
                    checked={sampleRequired}
                    onChange={setSampleRequired}
                  />
                </div>

                <Separator />

                <div>
                  <Label>การรับรอง / มาตรฐานที่ต้องการ</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                    เลือกใบรับรองที่จำเป็น (ไม่จำเป็นต้องเลือก)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CERTS.map((c) => {
                      const active = selectedCerts.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCert(c)}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs transition-all",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-accent text-muted-foreground"
                          )}
                        >
                          {active && "✓ "}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
            >
              ย้อนกลับ
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
              >
                ถัดไป
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton />
            )}
          </div>
        </div>

        {/* Sidebar — AI preview + tips */}
        <div className="space-y-4">
          <Card className="sticky top-20 bg-gradient-to-br from-blue-500/5 via-card to-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {description.length < 20 ? (
                <p className="text-xs text-muted-foreground italic">
                  กรอกรายละเอียดเพิ่มเพื่อให้ AI แนะนำ HS Code และคำนวณอากร
                </p>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      HS Code แนะนำ
                    </p>
                    <Badge variant="outline" className="mt-1 font-mono">
                      AI จะ classify ตอนสร้าง
                    </Badge>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      ระบบจะคำนวณอากรอัตโนมัติเมื่อ RFQ ถูกสร้าง
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">อากร MFN ปกติ</span>
                      <span className="font-medium">~10%</span>
                    </div>
                    {requireFormE && (
                      <div className="flex justify-between">
                        <span className="text-emerald-400">มี Form E</span>
                        <span className="font-medium text-emerald-400">0%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT</span>
                      <span className="font-medium">7%</span>
                    </div>
                  </div>

                  {targetPrice && quantity && requireFormE && (
                    <>
                      <Separator />
                      <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
                          ประหยัดถ้าใช้ Form E
                        </p>
                        <p className="mt-0.5 text-lg font-bold text-emerald-400 tabular-nums">
                          ฿
                          {Math.round(
                            Number(quantity) * Number(targetPrice) * 36 * 0.1
                          ).toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-medium">เทคนิคให้ได้ quote ดี</p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ใส่สเปกให้ละเอียด — supplier จะเสนอราคาแม่นกว่า
                </li>
                <li className="flex gap-2">
                  <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  เปิดประเทศหลายอัน — แข่งราคาดี ลด lead time
                </li>
                <li className="flex gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ใส่ Incoterm + port ปลายทาง — quote ครอบคลุมค่าส่งจริง
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Send className="h-4 w-4" />
      {pending ? "กำลังส่ง..." : "ส่ง RFQ ไปยัง suppliers"}
    </Button>
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
  onChange: (b: boolean) => void;
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
