import Link from "next/link";
import { Sparkles, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="text-base font-semibold">LogisticsNex</p>
        </Link>

        <p className="mt-12 text-7xl font-bold tabular-nums text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          ไม่พบหน้าที่คุณค้นหา
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          ลิงก์อาจถูกย้าย, ลบ, หรือพิมพ์ผิด ลองกลับไปหน้าหลักหรือค้นหาใหม่
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            ไปที่ Dashboard
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          ต้องการความช่วยเหลือ?{" "}
          <a
            href="mailto:hello@logisticsnex.com"
            className="text-primary hover:underline"
          >
            hello@logisticsnex.com
          </a>
        </p>
      </div>
    </div>
  );
}
