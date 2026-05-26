"use client";
import * as React from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileType,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadFile = {
  id: string;
  name: string;
  sizeKB: number;
  type: "pdf" | "image" | "other";
  progress: number;
};

function inferType(name: string): UploadFile["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "heic"].includes(ext)) return "image";
  return "other";
}

export function UploadDropzone() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<UploadFile[]>([
    {
      id: "1",
      name: "Invoice_SHZ-2025-04122.pdf",
      sizeKB: 842,
      type: "pdf",
      progress: 100,
    },
    {
      id: "2",
      name: "PackingList_SHZ-2025-04122.pdf",
      sizeKB: 318,
      type: "pdf",
      progress: 64,
    },
  ]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next: UploadFile[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      sizeKB: Math.round(f.size / 1024),
      type: inferType(f.name),
      progress: 0,
    }));
    setFiles((prev) => [...next, ...prev]);
    // simulate upload progress
    next.forEach((f) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((p) =>
            p.id === f.id
              ? { ...p, progress: Math.min(100, p.progress + 12) }
              : p
          )
        );
      }, 250);
      setTimeout(() => clearInterval(interval), 2500);
    });
  };

  return (
    <Card className="overflow-hidden">
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
            "relative cursor-pointer border-2 border-dashed transition-all",
            "m-4 rounded-xl p-10",
            isDragging
              ? "border-primary bg-primary/10"
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

          {/* Grid backdrop */}
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none rounded-xl" />

          <div className="relative flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30 transition-transform",
                isDragging && "scale-110"
              )}
            >
              <UploadCloud className="h-8 w-8 text-blue-400" />
            </div>

            <h3 className="text-base font-semibold">
              ลากและวางไฟล์เอกสารที่นี่
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              รองรับ Invoice, Packing List, B/L (PDF, JPG, PNG) ขนาดไม่เกิน 20 MB
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Button size="sm">
                <UploadCloud className="h-4 w-4" />
                เลือกไฟล์จากเครื่อง
              </Button>
              <Button size="sm" variant="outline" type="button">
                ดูตัวอย่างเอกสาร
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> PDF
              </div>
              <div className="h-1 w-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> JPG / PNG
              </div>
              <div className="h-1 w-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <FileType className="h-3.5 w-3.5" /> สูงสุด 20 MB
              </div>
            </div>
          </div>
        </div>

        {/* Upload queue */}
        {files.length > 0 && (
          <div className="border-t border-border bg-secondary/20 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                คิวการอัปโหลด ({files.length})
              </p>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ล้างทั้งหมด
              </button>
            </div>
            <div className="space-y-2">
              {files.map((f) => (
                <FileRow
                  key={f.id}
                  file={f}
                  onRemove={() =>
                    setFiles((prev) => prev.filter((p) => p.id !== f.id))
                  }
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FileRow({
  file,
  onRemove,
}: {
  file: UploadFile;
  onRemove: () => void;
}) {
  const Icon =
    file.type === "image" ? ImageIcon : file.type === "pdf" ? FileText : FileType;
  const done = file.progress >= 100;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 border border-border">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <span className="text-xs text-muted-foreground">
            {file.sizeKB} KB
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                done
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-blue-400 to-blue-600"
              )}
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {done ? "พร้อมส่ง AI" : `${file.progress}%`}
          </span>
        </div>
      </div>
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
