import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UploadDropzone } from "@/components/dashboard/upload-dropzone";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            สวัสดี, ปฏิกร <span className="text-muted-foreground font-normal">👋</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            คุณมีเอกสารรอดำเนินการ <span className="text-primary font-medium">12 รายการ</span> วันนี้
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          ระบบ AI ออนไลน์ · GPT-4o
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards />

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
              กดปุ่ม <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">⌘ K</kbd> เพื่อค้นหาเอกสารเก่าได้ทันที
            </li>
          </ul>
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              ความแม่นยำ HS Code เฉลี่ยเดือนนี้
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">96.4%</span>
              <span className="text-xs text-muted-foreground">จาก 287 รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity />
    </div>
  );
}
