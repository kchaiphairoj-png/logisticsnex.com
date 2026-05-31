import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UploadDropzone } from "@/components/dashboard/upload-dropzone";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth";
import { getDashboardSummary, getRecentDocuments } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const [user, org] = await Promise.all([getCurrentUser(), getCurrentOrg()]);
  const firstName =
    user?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "คุณ";

  const [summary, recent] = await Promise.all([
    getDashboardSummary(org?.id ?? null),
    getRecentDocuments(org?.id ?? null, 5),
  ]);

  const pendingSummaryText =
    summary.pending_docs > 0
      ? `คุณมีเอกสารรอดำเนินการ ${summary.pending_docs} รายการ วันนี้`
      : "ยังไม่มีเอกสารรอดำเนินการ — อัปโหลดเอกสารเพื่อให้ AI ช่วยวิเคราะห์ได้";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            สวัสดี, {firstName}{" "}
            <span className="text-muted-foreground font-normal">👋</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.pending_docs > 0 ? (
              <>
                คุณมีเอกสารรอดำเนินการ{" "}
                <span className="text-primary font-medium">
                  {summary.pending_docs} รายการ
                </span>{" "}
                วันนี้
              </>
            ) : (
              pendingSummaryText
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          ระบบ AI ออนไลน์ · GPT-4o
        </div>
      </div>

      {/* Summary cards (real data) */}
      <SummaryCards data={summary} />

      {/* Main upload + side info */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UploadDropzone />
        </div>

        {/* Quick tips card */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/10 via-card to-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20">
              <span className="text-sm">✨</span>
            </div>
            <h3 className="text-sm font-semibold">AI Tips</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              อัปโหลด Invoice + Packing List พร้อมกันเพื่อให้ AI ตรวจสอบความสอดคล้องอัตโนมัติ
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              เอกสารที่สแกนชัด (300+ DPI) จะได้ความแม่นยำ HS Code สูงกว่า 95%
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              กดปุ่ม{" "}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">
                ⌘ K
              </kbd>{" "}
              เพื่อค้นหาเอกสารเก่าได้ทันที
            </li>
          </ul>
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              เครดิต AI คงเหลือเดือนนี้
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {summary.ai_credits_left.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                จาก {summary.ai_credits_total.toLocaleString()} เครดิต
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity (real data) */}
      <RecentActivity rows={recent} />
    </div>
  );
}
