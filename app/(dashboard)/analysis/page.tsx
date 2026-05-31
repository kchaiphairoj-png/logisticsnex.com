import Link from "next/link";
import { Download, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireUser, getCurrentOrg } from "@/lib/auth";
import {
  listDocuments,
  getDocumentSummary,
  type DocumentStatus,
} from "@/lib/queries/documents";
import { AnalysisTable } from "./analysis-table";
import { cn, formatTHB } from "@/lib/utils";

interface SearchParams {
  status?: string;
  q?: string;
  page?: string;
}

export default async function AnalysisListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireUser("/analysis");
  const org = await getCurrentOrg();

  if (!org) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">ประวัติภาษี & HS Code</h1>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            กรุณาสร้างองค์กรของคุณก่อนเริ่มใช้งาน
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = (searchParams.status ?? "all") as DocumentStatus | "all";
  const q = searchParams.q ?? "";
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const [list, summary] = await Promise.all([
    listDocuments({
      org_id: org.id,
      status,
      q,
      page,
      page_size: 10,
    }),
    getDocumentSummary(org.id),
  ]);

  const stats = [
    {
      label: "เอกสารทั้งหมด",
      value: summary.total.toString(),
      sub: `ในองค์กร ${org.name}`,
    },
    {
      label: "สำเร็จ",
      value: summary.success_count.toString(),
      sub: `${summary.success_pct.toFixed(1)}%`,
      color: "text-emerald-400",
    },
    {
      label: "รอตรวจ",
      value: summary.review_count.toString(),
      sub: `${summary.review_pct.toFixed(1)}%`,
      color: "text-amber-400",
    },
    {
      label: "มูลค่ารวมเดือนนี้",
      value: formatTHB(summary.month_value_thb),
      sub: new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" }),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ประวัติภาษี & HS Code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ผลการวิเคราะห์เอกสารทั้งหมดที่ AI ประมวลผล
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" asChild>
            <Link href="/upload">
              <Sparkles className="h-3.5 w-3.5" />
              วิเคราะห์เอกสารใหม่
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", s.color)}>
                {s.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalysisTable
        items={list.items}
        total={list.total}
        page={list.page}
        totalPages={list.total_pages}
        initialStatus={status}
        initialQuery={q}
      />
    </div>
  );
}
