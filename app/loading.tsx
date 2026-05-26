import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -inset-1 animate-ping rounded-xl border-2 border-primary/40" />
        </div>
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      </div>
    </div>
  );
}
