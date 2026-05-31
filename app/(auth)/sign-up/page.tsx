"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [accepted, setAccepted] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);

  const strength = passwordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accepted) {
      setError("กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว");
      return;
    }
    if (strength.score < 2) {
      setError("รหัสผ่านอ่อนเกินไป — ใช้อย่างน้อย 12 ตัวอักษร พร้อมตัวเลข สัญลักษณ์");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
            company_name: companyName,
          },
        },
      });
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }

      // If email confirmation is required, Supabase returns a user but no session.
      if (!data.session) {
        setSuccessEmail(email);
        return;
      }

      // No email confirmation — go straight to dashboard
      router.push("/dashboard");
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
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
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
      window.location.href = data.url;
    } catch (err) {
      console.error("[OAuth] unexpected:", err);
      setError(
        `เกิดข้อผิดพลาดที่ไม่คาดคิด: ${(err as Error).message ?? "ลองใหม่อีกครั้ง"}`
      );
      setOauthLoading(null);
    }
  };

  // Email-sent success state
  if (successEmail) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
          <Mail className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">เช็คอีเมลของคุณ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            เราส่งลิงก์ยืนยันไปที่
          </p>
          <p className="mt-1 text-base font-medium">{successEmail}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            คลิกลิงก์ในอีเมลเพื่อยืนยันบัญชีและเริ่มใช้งาน LogisticsNex
          </p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-4 text-left">
          <p className="text-xs font-medium text-foreground mb-1">
            ไม่เห็นอีเมล?
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>· เช็คโฟลเดอร์ Spam / Junk</li>
            <li>· รอ 1-2 นาที (บางครั้งช้า)</li>
            <li>· ตรวจสะกดอีเมลให้ถูกต้อง</li>
          </ul>
        </div>
        <Link
          href="/sign-in"
          className="text-sm text-primary hover:underline inline-block"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Link href="/" className="flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="text-base font-semibold">LogisticsNex</p>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">สร้างบัญชีใหม่</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          เริ่มใช้งานฟรี 14 วัน · ไม่ต้องผูกบัตรเครดิต
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-rose-400">{error}</p>
        </div>
      )}

      {/* OAuth */}
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
          สมัครด้วย Google
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">หรือกรอกข้อมูล</span>
        <Separator className="flex-1" />
      </div>

      <form className="space-y-4" onSubmit={handleSignUp}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fname">ชื่อ</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fname"
                required
                placeholder="ปฏิกร"
                className="pl-9"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lname">นามสกุล</Label>
            <Input
              id="lname"
              required
              placeholder="ทวีสุข"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company">ชื่อบริษัท</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company"
              required
              placeholder="บจ. ตัวอย่าง"
              className="pl-9"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมลที่ทำงาน</Label>
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
          <Label htmlFor="password">รหัสผ่าน</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              placeholder="อย่างน้อย 12 ตัวอักษร"
              className="pl-9 pr-9"
              autoComplete="new-password"
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

          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < strength.score
                        ? strength.score >= 3
                          ? "bg-emerald-500"
                          : strength.score === 2
                          ? "bg-amber-500"
                          : "bg-rose-500"
                        : "bg-secondary"
                    )}
                  />
                ))}
              </div>
              <p
                className={cn(
                  "text-[11px]",
                  strength.score >= 3
                    ? "text-emerald-400"
                    : strength.score === 2
                    ? "text-amber-400"
                    : "text-rose-400"
                )}
              >
                ความแข็งแกร่ง: {strength.label}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="terms" className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="terms"
              className="h-4 w-4 rounded border-border bg-card text-primary mt-0.5"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              ฉันยอมรับ{" "}
              <a className="text-primary hover:underline">ข้อกำหนด</a> และ{" "}
              <a className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>{" "}
              รวมถึงการเก็บรักษาข้อมูลตาม PDPA
            </span>
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังสมัคร...
            </>
          ) : (
            <>
              สมัครใช้งาน
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <p className="text-xs font-medium">รวมในแพ็กเกจทดลอง 14 วัน:</p>
        <ul className="mt-2 space-y-1.5">
          {[
            "วิเคราะห์เอกสาร 50 ฉบับ + HS Code 200 ครั้ง",
            "เพิ่มสมาชิกได้ 3 คน",
            "เชื่อมต่อระบบ e-Customs และ LINE Notify",
            "Support ผ่าน Email และ LINE OA",
          ].map((f) => (
            <li key={f} className="flex gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

function passwordStrength(pw: string): { score: number; label: string } {
  if (pw.length === 0) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ["อ่อนมาก", "อ่อน", "ปานกลาง", "ดี", "แข็งแกร่ง"];
  return { score, label: labels[score] };
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists"))
    return "อีเมลนี้สมัครแล้ว — กรุณาเข้าสู่ระบบแทน";
  if (m.includes("weak password") || m.includes("password should"))
    return "รหัสผ่านอ่อนเกินไป — ใช้อย่างน้อย 8 ตัวอักษร";
  if (m.includes("invalid email"))
    return "รูปแบบอีเมลไม่ถูกต้อง";
  if (m.includes("rate limit") || m.includes("too many"))
    return "พยายามสมัครบ่อยเกินไป รอสักครู่แล้วลองใหม่";
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
