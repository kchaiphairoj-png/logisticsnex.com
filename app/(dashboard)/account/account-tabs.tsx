"use client";
import * as React from "react";
import {
  UserCircle,
  Shield,
  Monitor,
  Palette,
  Camera,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileForm, type ProfileFormProps } from "./profile-form";
import { cn } from "@/lib/utils";

export function AccountTabs({ profile }: { profile: ProfileFormProps }) {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="h-auto flex-wrap">
        <TabsTrigger value="profile">
          <UserCircle className="h-3.5 w-3.5 mr-1.5" />
          โปรไฟล์
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield className="h-3.5 w-3.5 mr-1.5" />
          ความปลอดภัย
        </TabsTrigger>
        <TabsTrigger value="sessions">
          <Monitor className="h-3.5 w-3.5 mr-1.5" />
          Sessions
        </TabsTrigger>
        <TabsTrigger value="preferences">
          <Palette className="h-3.5 w-3.5 mr-1.5" />
          การตั้งค่าส่วนตัว
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileForm {...profile} />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>
      <TabsContent value="sessions">
        <SessionsTab />
      </TabsContent>
      <TabsContent value="preferences">
        <PreferencesTab />
      </TabsContent>
    </Tabs>
  );
}

/* ─────────────────────────────────────────────────────────── */

function SecurityTab() {
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [twofa, setTwofa] = React.useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
          <CardDescription>
            ใช้รหัสที่แข็งแรง — อย่างน้อย 12 ตัวอักษร พร้อม ตัวเลข สัญลักษณ์ และตัวพิมพ์ใหญ่
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasswordField id="old" label="รหัสผ่านปัจจุบัน" show={showOld} onToggle={() => setShowOld((s) => !s)} />
          <PasswordField id="new" label="รหัสผ่านใหม่" show={showNew} onToggle={() => setShowNew((s) => !s)} />
          <PasswordField id="confirm" label="ยืนยันรหัสผ่านใหม่" show={showNew} onToggle={() => setShowNew((s) => !s)} />
          <div className="flex justify-end">
            <Button disabled>
              <KeyRound className="h-4 w-4" />
              อัปเดตรหัสผ่าน
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            * Feature การเปลี่ยนรหัสผ่านจะเชื่อมต่อในรอบถัดไป — ตอนนี้ใช้ "ลืมรหัสผ่าน" ที่หน้า sign-in แทน
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>การยืนยันตัวตน 2 ขั้น (2FA)</CardTitle>
            <CardDescription>
              เพิ่มชั้นความปลอดภัยด้วย Authenticator App หรือ SMS
            </CardDescription>
          </div>
          <Switch checked={twofa} onCheckedChange={setTwofa} disabled />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            * 2FA จะเปิดให้ใช้งานเมื่อ Supabase MFA ถูก enable ใน Project Settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={show ? "text" : "password"} className="pr-9" disabled />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function SessionsTab() {
  // Supabase doesn't yet expose active sessions API — show placeholder.
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>อุปกรณ์ที่เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            ดูและจัดการอุปกรณ์ที่กำลังใช้งานบัญชีของคุณ
          </CardDescription>
        </div>
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="destructive" size="sm">
            <LogOut className="h-3.5 w-3.5" />
            ออกจากระบบ
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Laptop className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  อุปกรณ์ปัจจุบัน (เบราว์เซอร์นี้)
                </p>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Session ที่กำลังใช้งานอยู่ตอนนี้
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          * รายการ session อื่นๆ จะแสดงเมื่อเปิด Supabase MFA / session listing
        </p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────── */

function PreferencesTab() {
  const [lang, setLang] = React.useState("th");
  const [theme, setTheme] = React.useState("dark");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>การแสดงผล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="lang">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                ภาษา
              </span>
            </Label>
            <Select id="lang" value={lang} onChange={(e) => setLang(e.target.value)} className="h-10">
              <option value="th">🇹🇭 ไทย</option>
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 中文</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ธีม</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", label: "Light", preview: "bg-white border-slate-200" },
                { value: "dark", label: "Dark", preview: "bg-slate-900 border-slate-700" },
                { value: "system", label: "ตามระบบ", preview: "bg-gradient-to-br from-white to-slate-900 border-slate-500" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border p-3 text-center transition-all",
                    theme === t.value
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn("h-12 w-full rounded-md border", t.preview)} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            * Theme switching จะเก็บใน localStorage ในรอบถัดไป
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
