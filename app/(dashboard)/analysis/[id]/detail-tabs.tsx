"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { retriggerExtract } from "@/lib/actions/documents";
import { cn, formatTHB } from "@/lib/utils";
import type { DocumentDetail, DocumentItem } from "@/lib/queries/document-detail";

export function DetailTabs({
  doc,
  docMeta,
}: {
  doc: DocumentDetail;
  docMeta: { label: string; value: string }[];
}) {
  return (
    <Tabs defaultValue="items">
      <TabsList>
        <TabsTrigger value="items">
          <Package className="h-3.5 w-3.5 mr-1.5" />
          รายการสินค้า
        </TabsTrigger>
        <TabsTrigger value="header">ข้อมูลส่วนหัว</TabsTrigger>
        <TabsTrigger value="raw">บันทึก AI</TabsTrigger>
      </TabsList>

      <TabsContent value="items">
        <LineItemsList items={doc.items} status={doc.ocr_status} docId={doc.id} />
      </TabsContent>

      <TabsContent value="header">
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            {docMeta.map((m) => (
              <div key={m.label}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 text-sm font-medium">{m.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="raw">
        <Card>
          <CardContent className="p-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              ผลดิบจาก AI Extractor (JSON)
            </p>
            <pre className="overflow-x-auto rounded-md bg-secondary/40 p-4 text-xs leading-relaxed">
              {doc.raw_extraction
                ? JSON.stringify(doc.raw_extraction, null, 2)
                : "(ยังไม่ได้ประมวลผล)"}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function LineItemsList({
  items,
  status,
  docId,
}: {
  items: DocumentItem[];
  status: DocumentDetail["ocr_status"];
  docId: string;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retriggerExtract(docId);
    router.refresh();
    setRetrying(false);
  };

  // States the user sees while AI processes
  if (status === "pending" || status === "processing") {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-base font-medium">AI กำลังวิเคราะห์เอกสาร...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ใช้เวลาประมาณ 8-15 วินาที — refresh หน้านี้เพื่อดูผลล่าสุด
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className="border-rose-500/30">
        <CardContent className="p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <p className="text-base font-medium text-rose-400">AI วิเคราะห์ไม่สำเร็จ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            อาจเพราะภาพไม่ชัด, OpenAI quota หมด, หรือเอกสารไม่ใช่ Invoice
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            ลองวิเคราะห์ใหม่
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          ไม่พบรายการสินค้าในเอกสาร
        </CardContent>
      </Card>
    );
  }

  // status === "done" → render items
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ItemRow({ item }: { item: DocumentItem }) {
  const conf = Number(item.hs_confidence ?? 0);
  const confColor =
    conf >= 0.9
      ? "text-emerald-400"
      : conf >= 0.75
      ? "text-amber-400"
      : conf > 0
      ? "text-rose-400"
      : "text-muted-foreground";

  const confBar =
    conf >= 0.9
      ? "from-emerald-400 to-emerald-500"
      : conf >= 0.75
      ? "from-amber-400 to-amber-500"
      : "from-rose-400 to-rose-500";

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
            {(item.line_no ?? 0).toString().padStart(2, "0")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {item.description_th ?? item.description}
                </p>
                {item.description_th && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                {item.amount != null && (
                  <p className="text-sm font-medium tabular-nums">
                    ${Number(item.amount).toFixed(2)}
                  </p>
                )}
                {item.qty != null && (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {item.qty} {item.unit ?? "pcs"}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {item.hs_code ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {item.hs_code}
                </Badge>
              ) : (
                <Badge variant="warning" className="text-xs">
                  รอ HS Code
                </Badge>
              )}
              {conf > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", confBar)}
                      style={{ width: `${conf * 100}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-semibold tabular-nums", confColor)}>
                    {(conf * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {item.verified_by_user ? (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" /> ยืนยันแล้ว
                </Badge>
              ) : (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3" /> รอตรวจ
                </Badge>
              )}
              {item.country_of_origin && (
                <Badge variant="outline" className="text-xs">
                  {item.country_of_origin}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
