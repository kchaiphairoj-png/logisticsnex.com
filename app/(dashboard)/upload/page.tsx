"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { registerUploadedDocument } from "@/lib/actions/documents";
import { cn } from "@/lib/utils";

type FileStatus = "queued" | "uploading" | "registering" | "done" | "error";

type UploadFile = {
  id: string;            // UUID for documents.id + storage filename
  file: File;
  name: string;
  sizeKB: number;
  type: "pdf" | "image" | "other";
  status: FileStatus;
  progress: number;
  error?: string;
  detectedDocType?: "invoice" | "packing_list" | "bl" | "awb" | "other";
};

const DOC_BUCKET = "documents";

function inferType(name: string): UploadFile["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "heic"].includes(ext)) return "image";
  return "other";
}

function inferDocType(name: string): UploadFile["detectedDocType"] {
  const lower = name.toLowerCase();
  if (lower.includes("inv")) return "invoice";
  if (lower.includes("pack") || lower.match(/\bpl\b/)) return "packing_list";
  if (lower.includes("bl") || lower.includes("bill")) return "bl";
  if (lower.includes("awb")) return "awb";
  return "invoice"; // sensible default
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [autoAnalyze, setAutoAnalyze] = React.useState(true);
  const [supplier, setSupplier] = React.useState("");
  const [incoterm, setIncoterm] = React.useState("CIF");
  const [currency, setCurrency] = React.useState("USD");
  const [origin, setOrigin] = React.useState("CN");
  const [notes, setNotes] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next: UploadFile[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      sizeKB: Math.round(f.size / 1024),
      type: inferType(f.name),
      detectedDocType: inferDocType(f.name),
      status: "queued",
      progress: 0,
    }));
    setFiles((prev) => [...next, ...prev]);
    next.forEach(uploadFile);
  };

  const update = (id: string, patch: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const uploadFile = async (f: UploadFile) => {
    try {
      update(f.id, { status: "uploading", progress: 5 });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ");

      // Need org_id to build the path
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("default_org_id")
        .eq("id", user.id)
        .maybeSingle();

      const orgId = profile?.default_org_id;
      if (!orgId) throw new Error("ไม่พบองค์กรของคุณ — โปรดเข้าสู่ระบบใหม่");

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${orgId}/${yyyy}/${mm}/${f.id}.${ext}`;

      update(f.id, { progress: 25 });

      const { error: uploadError } = await supabase.storage
        .from(DOC_BUCKET)
        .upload(path, f.file, {
          contentType: f.file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      update(f.id, { status: "registering", progress: 75 });

      const result = await registerUploadedDocument({
        document_id: f.id,
        storage_path: path,
        file_name: f.name,
        file_size: f.file.size,
        mime: f.file.type || "application/octet-stream",
        doc_type: f.detectedDocType ?? "invoice",
        supplier_name: supplier || undefined,
        origin_country: origin || undefined,
        incoterm: incoterm || undefined,
        currency: currency || undefined,
        notes: notes || undefined,
      });

      if (!result.ok) throw new Error(result.message);

      update(f.id, { status: "done", progress: 100 });
    } catch (err) {
      console.error(err);
      update(f.id, {
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const clearDone = () =>
    setFiles((prev) => prev.filter((p) => p.status !== "done"));

  const queueStats = {
    total: files.length,
    done: files.filter((f) => f.status === "done").length,
    processing: files.filter(
      (f) => f.status === "uploading" || f.status === "registering"
    ).length,
    error: files.filter((f) => f.status === "error").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">อัปโหลดเอกสาร</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">อัปโหลดเอกสาร</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ลากไฟล์ Invoice, Packing List, B/L หรือ AWB เข้ามา — AI จะวิเคราะห์อัตโนมัติ
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
          <Switch checked={autoAnalyze} onCheckedChange={setAutoAnalyze} id="auto" />
          <Label htmlFor="auto" className="cursor-pointer">
            <span className="text-sm">วิเคราะห์ HS Code อัตโนมัติ</span>
            <p className="text-[11px] text-muted-foreground">
              {queueStats.total > 0 ? `ใช้ ${queueStats.total} เครดิต` : "ใช้ 1 เครดิตต่อไฟล์"}
            </p>
          </Label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: dropzone + queue */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer border-2 border-dashed m-4 rounded-xl p-12 transition-all",
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none rounded-xl" />
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30 transition-transform",
                      isDragging && "scale-110"
                    )}
                  >
                    <UploadCloud className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือก
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    รองรับหลายไฟล์พร้อมกัน — PDF, JPG, PNG ขนาดไฟล์สูงสุด 20 MB ต่อไฟล์
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <Badge variant="outline">Invoice</Badge>
                    <Badge variant="outline">Packing List</Badge>
                    <Badge variant="outline">Bill of Lading</Badge>
                    <Badge variant="outline">Airway Bill</Badge>
                  </div>
                  <Button className="mt-5" type="button">
                    <UploadCloud className="h-4 w-4" />
                    เลือกไฟล์จากเครื่อง
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue */}
          {files.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle>คิวการอัปโหลด</CardTitle>
                  <CardDescription>
                    {queueStats.done}/{queueStats.total} เสร็จสมบูรณ์
                    {queueStats.processing > 0 && ` · ${queueStats.processing} กำลังประมวลผล`}
                    {queueStats.error > 0 && ` · ${queueStats.error} ผิดพลาด`}
                  </CardDescription>
                </div>
                {queueStats.done > 0 && (
                  <Button variant="outline" size="sm" onClick={clearDone}>
                    ล้างที่เสร็จแล้ว
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {files.map((f) => (
                  <FileRow
                    key={f.id}
                    file={f}
                    onRemove={() =>
                      setFiles((prev) => prev.filter((p) => p.id !== f.id))
                    }
                    onView={() => router.push(`/analysis/${f.id}`)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: metadata + tips */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ข้อมูล Batch (เลือกได้)</CardTitle>
              <CardDescription className="text-xs">
                ถ้ากรอกล่วงหน้า AI จะใช้เป็น context ในการวิเคราะห์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="เช่น Shenzhen Tech Co."
                  className="h-9"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="incoterm">Incoterm</Label>
                  <Select
                    id="incoterm"
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value)}
                    className="h-9 text-sm"
                  >
                    {["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ccy">สกุลเงิน</Label>
                  <Select
                    id="ccy"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-9 text-sm"
                  >
                    {["USD", "EUR", "JPY", "CNY", "THB"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="origin">ประเทศต้นทาง</Label>
                <Select
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-9 text-sm"
                >
                  <option value="CN">🇨🇳 จีน</option>
                  <option value="JP">🇯🇵 ญี่ปุ่น</option>
                  <option value="KR">🇰🇷 เกาหลีใต้</option>
                  <option value="VN">🇻🇳 เวียดนาม</option>
                  <option value="IN">🇮🇳 อินเดีย</option>
                  <option value="DE">🇩🇪 เยอรมนี</option>
                  <option value="US">🇺🇸 สหรัฐฯ</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="เช่น สินค้าทดลอง, รอเอกสารเพิ่ม..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 via-card to-card">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold">เทคนิคเพิ่มความแม่นยำ</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  สแกนเอกสารที่ 300+ DPI หากเป็นภาพถ่าย
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ตั้งค่า supplier + origin ก่อนอัปโหลด — AI จะใช้เป็น context
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  หลีกเลี่ยงไฟล์ที่มีหลาย invoice ในไฟล์เดียวกัน
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FileRow({
  file,
  onRemove,
  onView,
}: {
  file: UploadFile;
  onRemove: () => void;
  onView: () => void;
}) {
  const Icon = file.type === "image" ? ImageIcon : FileText;

  const statusLabel: Record<FileStatus, string> = {
    queued: "รอคิว",
    uploading: "กำลังอัปโหลด",
    registering: "กำลังบันทึก + เรียก AI",
    done: "✓ พร้อมวิเคราะห์",
    error: "ผิดพลาด",
  };

  const showProgress =
    file.status === "uploading" || file.status === "registering";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            {file.detectedDocType && (
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {file.detectedDocType}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {file.sizeKB} KB
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span
              className={cn(
                "text-xs font-medium",
                file.status === "done"
                  ? "text-emerald-400"
                  : file.status === "error"
                  ? "text-rose-400"
                  : file.status === "registering"
                  ? "text-sky-400"
                  : "text-muted-foreground"
              )}
            >
              {statusLabel[file.status]}
            </span>
          </div>
        </div>

        {showProgress && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  file.status === "registering"
                    ? "bg-gradient-to-r from-sky-400 to-blue-500"
                    : "bg-gradient-to-r from-blue-400 to-blue-600"
                )}
                style={{ width: `${file.progress}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
              {file.progress}%
            </span>
          </div>
        )}

        {file.status === "error" && file.error && (
          <p className="mt-1.5 text-xs text-rose-400">{file.error}</p>
        )}
      </div>
      {file.status === "done" ? (
        <Button variant="ghost" size="sm" onClick={onView}>
          <Sparkles className="h-3.5 w-3.5" />
          ดูผล
        </Button>
      ) : file.status === "uploading" || file.status === "registering" ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
          aria-label="ลบไฟล์"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
