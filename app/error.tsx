"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, send to Sentry / LogRocket / etc.
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15">
          <AlertTriangle className="h-7 w-7 text-rose-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">เกิดข้อผิดพลาด</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ระบบพบปัญหาในการประมวลผล — ทีมงานได้รับการแจ้งเตือนแล้ว
        </p>

        {error.digest && (
          <p className="mt-4 inline-block rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          ปัญหายังไม่หาย?{" "}
          <a
            href="mailto:support@logisticsnex.com"
            className="text-primary hover:underline"
          >
            ติดต่อทีม support
          </a>
        </p>
      </div>
    </div>
  );
}
