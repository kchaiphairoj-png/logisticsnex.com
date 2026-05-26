"use client";
import * as React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const [showPw, setShowPw] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const strength = passwordStrength(password);

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

      {/* OAuth */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-center gap-3" type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1 0-.73.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 001 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          สมัครด้วย Google
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">หรือกรอกข้อมูล</span>
        <Separator className="flex-1" />
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fname">ชื่อ</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="fname" placeholder="ปฏิกร" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lname">นามสกุล</Label>
            <Input id="lname" placeholder="ทวีสุข" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company">ชื่อบริษัท</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="company" placeholder="บจ. ตัวอย่าง" className="pl-9" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมลที่ทำงาน</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="name@company.co.th" className="pl-9" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="อย่างน้อย 12 ตัวอักษร"
              className="pl-9 pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength meter */}
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
              defaultChecked
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              ฉันยอมรับ{" "}
              <a className="text-primary hover:underline">ข้อกำหนด</a> และ{" "}
              <a className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>{" "}
              รวมถึงการเก็บรักษาข้อมูลตาม PDPA
            </span>
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg">
          สมัครใช้งาน
          <ArrowRight className="h-4 w-4" />
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
