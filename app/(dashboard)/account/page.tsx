"use client";
import * as React from "react";
import Link from "next/link";
import {
  UserCircle,
  Shield,
  Monitor,
  Palette,
  Camera,
  Save,
  Smartphone,
  Laptop,
  KeyRound,
  Eye,
  EyeOff,
  ChevronRight,
  Globe,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
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
import { cn } from "@/lib/utils";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">บัญชีผู้ใช้</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">บัญชีผู้ใช้</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ข้อมูลส่วนตัว, ความปลอดภัย และการตั้งค่าส่วนบุคคล
        </p>
      </div>

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

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="sessions"><SessionsTab /></TabsContent>
        <TabsContent value="preferences"><PreferencesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function ProfileTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          <CardDescription>
            ข้อมูลนี้จะแสดงในระบบและใน audit logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
                ปท
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border hover:bg-accent">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-semibold">ปฏิกร ทวีสุข</h3>
              <p className="text-sm text-muted-foreground">Owner · บจ. ตัวอย่าง อิมพอร์ต</p>
              <div className="mt-2 flex items-center gap-2">
                <Button variant="outline" size="sm">
                  เปลี่ยนรูปภาพ
                </Button>
                <Button variant="ghost" size="sm">
                  ลบ
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Form */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fname">ชื่อ</Label>
              <Input id="fname" defaultValue="ปฏิกร" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lname">นามสกุล</Label>
              <Input id="lname" defaultValue="ทวีสุข" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  อีเมล
                </span>
              </Label>
              <div className="flex gap-2">
                <Input id="email" type="email" defaultValue="patikorn@example.co.th" />
                <Badge variant="success" className="self-center shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  ยืนยันแล้ว
                </Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  เบอร์โทรศัพท์
                </span>
              </Label>
              <Input id="phone" type="tel" defaultValue="081-234-5678" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job">ตำแหน่ง</Label>
              <Input id="job" defaultValue="Import Manager" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">ยกเลิก</Button>
        <Button>
          <Save className="h-4 w-4" />
          บันทึก
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function SecurityTab() {
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [twofa, setTwofa] = React.useState(true);

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
            <Button>
              <KeyRound className="h-4 w-4" />
              อัปเดตรหัสผ่าน
            </Button>
          </div>
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
          <Switch checked={twofa} onCheckedChange={setTwofa} />
        </CardHeader>
        {twofa && (
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">เปิดใช้งานแล้ว · Google Authenticator</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ตั้งค่าเมื่อ 18 มี.ค. 2568
                </p>
              </div>
              <Button variant="outline" size="sm">
                ตั้งค่าใหม่
              </Button>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium mb-2">Backup Codes</p>
              <p className="text-xs text-muted-foreground mb-3">
                เก็บไว้ในที่ปลอดภัย — ใช้เมื่อ Authenticator ไม่สามารถใช้งานได้
              </p>
              <Button variant="outline" size="sm">
                ดู Backup Codes
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>กิจกรรมความปลอดภัยล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { icon: CheckCircle2, color: "text-emerald-400", title: "เข้าสู่ระบบสำเร็จ", desc: "จาก Chrome บน Windows · กรุงเทพ", time: "5 นาทีที่แล้ว" },
            { icon: CheckCircle2, color: "text-emerald-400", title: "เปลี่ยนรหัสผ่าน", desc: "ผ่านหน้าตั้งค่า", time: "15 พ.ค. 2568" },
            { icon: AlertTriangle, color: "text-amber-400", title: "พยายามเข้าสู่ระบบล้มเหลว", desc: "จาก unknown device · เชียงใหม่", time: "10 พ.ค. 2568" },
          ].map((e, i) => {
            const I = e.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-3">
                <I className={cn("h-4 w-4 shrink-0 mt-0.5", e.color)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground">{e.time}</span>
              </div>
            );
          })}
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
        <Input id={id} type={show ? "text" : "password"} className="pr-9" />
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

const sessions = [
  { id: "1", current: true, device: "Chrome on Windows 11", location: "กรุงเทพ, ไทย", ip: "171.96.123.45", lastActive: "ใช้งานอยู่", icon: Laptop },
  { id: "2", current: false, device: "Safari on iPhone 15", location: "กรุงเทพ, ไทย", ip: "171.96.123.45", lastActive: "2 ชม.ที่แล้ว", icon: Smartphone },
  { id: "3", current: false, device: "Chrome on macOS", location: "เชียงใหม่, ไทย", ip: "203.150.4.12", lastActive: "เมื่อวาน", icon: Laptop },
  { id: "4", current: false, device: "Firefox on Linux", location: "Singapore", ip: "8.8.8.8", lastActive: "3 วันที่แล้ว", icon: Laptop },
];

function SessionsTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>อุปกรณ์ที่เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            ดูและจัดการอุปกรณ์ที่กำลังใช้งานบัญชีของคุณ
          </CardDescription>
        </div>
        <Button variant="destructive" size="sm">
          <LogOut className="h-3.5 w-3.5" />
          ออกจากระบบทุกที่
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4",
                s.current ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/30"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-md",
                  s.current ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{s.device}</p>
                  {s.current && <Badge variant="success">อุปกรณ์ปัจจุบัน</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.location} · IP {s.ip}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  ใช้งานล่าสุด: {s.lastActive}
                </p>
              </div>
              {!s.current && (
                <Button variant="outline" size="sm">
                  ออกจากระบบ
                </Button>
              )}
            </div>
          );
        })}
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

          <div className="space-y-1.5">
            <Label htmlFor="ts">รูปแบบวันที่</Label>
            <Select id="ts" defaultValue="th" className="h-10">
              <option value="th">26 พ.ค. 2568 (พ.ศ.)</option>
              <option value="en">May 26, 2025</option>
              <option value="iso">2025-05-26</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>การทำงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "เปิดผลการวิเคราะห์อัตโนมัติ", desc: "ไปยังหน้าผลทันทีหลัง AI วิเคราะห์เสร็จ", defaultChecked: true },
            { label: "แสดง keyboard shortcut", desc: "เห็นปุ่ม ⌘ K, ⌘ N เมื่อ hover ปุ่ม", defaultChecked: true },
            { label: "ใช้คำย่อสกุลเงิน", desc: "แสดง ฿1.2M แทน ฿1,200,000", defaultChecked: false },
            { label: "เสียง notification", desc: "เล่นเสียงเมื่อมีการแจ้งเตือนใหม่", defaultChecked: false },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
              <Switch defaultChecked={p.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
