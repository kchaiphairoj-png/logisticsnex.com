"use client";
import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const [showPw, setShowPw] = React.useState(false);

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Mobile logo */}
      <Link href="/" className="flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="text-base font-semibold">LogisticsNex</p>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          ยินดีต้อนรับกลับ — กรุณาเข้าสู่ระบบเพื่อใช้งาน
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-center gap-3" type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1 0-.73.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 001 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          เข้าสู่ระบบด้วย Google
        </Button>
        <Button variant="outline" className="w-full justify-center gap-3" type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#00B900">
            <path d="M19.365 9.863c.349 0 .63.285.631.631 0 .345-.281.63-.631.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          เข้าสู่ระบบด้วย LINE
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <Separator className="flex-1" />
      </div>

      {/* Form */}
      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.co.th"
              className="pl-9"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-9"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-border bg-card text-primary"
            defaultChecked
          />
          <Label htmlFor="remember" className="cursor-pointer text-xs">
            จดจำการเข้าสู่ระบบในเครื่องนี้
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg">
          เข้าสู่ระบบ
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          สมัครใช้งาน (ทดลองฟรี 14 วัน)
        </Link>
      </p>

      <p className="text-center text-[11px] text-muted-foreground">
        การเข้าสู่ระบบหมายความว่าคุณยอมรับ{" "}
        <a className="hover:text-foreground">ข้อกำหนด</a> และ{" "}
        <a className="hover:text-foreground">นโยบายความเป็นส่วนตัว</a>
      </p>
    </div>
  );
}
