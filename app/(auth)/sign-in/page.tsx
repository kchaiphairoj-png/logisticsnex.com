"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }
      // Force a full navigation so middleware re-reads the session cookie
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด ลองใหม่อีกครั้ง");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    setError(null);
    setOauthLoading(provider);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });
      if (error) {
        console.error("[OAuth] signInWithOAuth error:", error);
        setError(translateOAuthError(error.message, provider));
        setOauthLoading(null);
        return;
      }
      if (!data?.url) {
        setError(
          `Supabase ไม่ได้คืน redirect URL — ตรวจสอบว่า provider "${provider}" ถูกเปิดใน Supabase Dashboard → Authentication → Providers`
        );
        setOauthLoading(null);
        return;
      }
      // Manual redirect (Supabase normally does this, but make it explicit so we see what happens)
      window.location.href = data.url;
    } catch (err) {
      console.error("[OAuth] unexpected:", err);
      setError(
        `เกิดข้อผิดพลาดที่ไม่คาดคิด: ${(err as Error).message ?? "ลองใหม่อีกครั้ง"}`
      );
      setOauthLoading(null);
    }
  };

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

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-rose-400">{error}</p>
        </div>
      )}

      {/* OAuth buttons */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-center gap-3"
          type="button"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuth("google")}
        >
          {oauthLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1 0-.73.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 001 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
          )}
          เข้าสู่ระบบด้วย Google
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <Separator className="flex-1" />
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleEmailSignIn}>
        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              placeholder="name@company.co.th"
              className="pl-9"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              required
              placeholder="••••••••"
              className="pl-9 pr-9"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>
              เข้าสู่ระบบ
              <ArrowRight className="h-4 w-4" />
            </>
          )}
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

/**
 * Map Supabase auth error messages to friendly Thai messages.
 */
function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("email not confirmed"))
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ — เช็คใน inbox";
  if (m.includes("too many requests"))
    return "พยายามเข้าสู่ระบบบ่อยเกินไป รอสักครู่แล้วลองใหม่";
  if (m.includes("network"))
    return "เชื่อมต่ออินเทอร์เน็ตไม่ได้";
  return msg;
}

/**
 * Map common OAuth provider setup errors to actionable Thai instructions.
 */
function translateOAuthError(msg: string, provider: string): string {
  const m = msg.toLowerCase();
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) {
    return `Provider "${provider}" ยังไม่ถูกเปิดใน Supabase — ไป Dashboard → Authentication → Providers → ${provider} → Enable`;
  }
  if (m.includes("redirect") && m.includes("not allowed")) {
    return `Redirect URL ไม่ถูกอนุญาต — เพิ่ม ${window.location.origin}/auth/callback ใน Supabase → Authentication → URL Configuration`;
  }
  if (m.includes("validation_failed")) {
    return `Supabase config ของ ${provider} ไม่ครบ — ตรวจ Client ID / Client Secret`;
  }
  return msg;
}
