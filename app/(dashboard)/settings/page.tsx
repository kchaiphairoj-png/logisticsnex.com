"use client";
import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Key,
  Bell,
  Receipt,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Mail,
  MessageCircle,
  Slack,
  Download,
  ChevronRight,
  Save,
  ExternalLink,
  Globe,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatTHB } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">การตั้งค่า</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">การตั้งค่า</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          จัดการองค์กร, สมาชิก, การเชื่อมต่อ และการแจ้งเตือน
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="general">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            ทั่วไป
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            สมาชิกทีม
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="h-3.5 w-3.5 mr-1.5" />
            API & Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            การแจ้งเตือน
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            ประวัติการชำระเงิน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="team"><TeamTab /></TabsContent>
        <TabsContent value="api"><ApiTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="invoices"><InvoicesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function GeneralTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลองค์กร</CardTitle>
          <CardDescription>
            ใช้สำหรับออกใบกำกับภาษีและยื่นเอกสารต่อกรมศุลกากร
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
              บอ
            </div>
            <div>
              <Button variant="outline" size="sm">
                อัปโหลดโลโก้
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">
                PNG หรือ SVG สูงสุด 2MB
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อบริษัท (TH)" id="name-th" defaultValue="บจ. ตัวอย่าง อิมพอร์ต" />
            <Field label="Company Name (EN)" id="name-en" defaultValue="Example Import Co., Ltd." />
            <Field label="เลขประจำตัวผู้เสียภาษี" id="tax-id" defaultValue="0-1234-56789-01-2" />
            <Field label="เลขทะเบียนพาณิชย์" id="reg-no" defaultValue="0105561234567" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              rows={2}
              defaultValue="123/45 อาคารตัวอย่าง ชั้น 12 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="country">ประเทศ</Label>
              <Select id="country" defaultValue="TH" className="h-10">
                <option value="TH">🇹🇭 ไทย</option>
                <option value="SG">🇸🇬 สิงคโปร์</option>
                <option value="MY">🇲🇾 มาเลเซีย</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">เขตเวลา</Label>
              <Select id="tz" defaultValue="bkk" className="h-10">
                <option value="bkk">Asia/Bangkok (UTC+7)</option>
                <option value="sgt">Asia/Singapore (UTC+8)</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ccy">สกุลเงินหลัก</Label>
              <Select id="ccy" defaultValue="THB" className="h-10">
                <option value="THB">THB (฿)</option>
                <option value="USD">USD ($)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-500/20">
        <CardHeader>
          <CardTitle className="text-rose-400">โซนอันตราย</CardTitle>
          <CardDescription>
            การดำเนินการที่ไม่สามารถยกเลิกได้
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">ลบองค์กรนี้</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ลบข้อมูลทั้งหมดและยกเลิกการสมาชิกอย่างถาวร
              </p>
            </div>
            <Button variant="destructive" size="sm">
              ลบองค์กร
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">ยกเลิก</Button>
        <Button>
          <Save className="h-4 w-4" />
          บันทึกการเปลี่ยนแปลง
        </Button>
      </div>
    </div>
  );
}

function Field({ label, id, defaultValue }: { label: string; id: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={defaultValue} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

const team = [
  { name: "ปฏิกร ทวีสุข", email: "patikorn@example.co.th", role: "owner", initials: "ปท", lastActive: "ออนไลน์อยู่" },
  { name: "ธนพร ศรีสมบัติ", email: "thanaporn@example.co.th", role: "admin", initials: "ธพ", lastActive: "5 นาทีที่แล้ว" },
  { name: "อนุพงษ์ จันทรา", email: "anupong@example.co.th", role: "member", initials: "อจ", lastActive: "2 ชม.ที่แล้ว" },
  { name: "วิภาวี ทองคำ", email: "vipawee@example.co.th", role: "member", initials: "วท", lastActive: "เมื่อวาน" },
  { name: "external@auditor.co.th", email: "external@auditor.co.th", role: "viewer", initials: "EX", lastActive: "1 สัปดาห์ที่แล้ว" },
];

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  owner: { label: "Owner", variant: "default" },
  admin: { label: "Admin", variant: "secondary" },
  member: { label: "Member", variant: "outline" },
  viewer: { label: "Viewer", variant: "outline" },
};

function TeamTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>สมาชิกทีม</CardTitle>
            <CardDescription>
              5 สมาชิก · จาก 10 ที่นั่งตาม Pro Plan
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            เชิญสมาชิก
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">สมาชิก</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>กิจกรรมล่าสุด</TableHead>
                <TableHead className="pr-6 text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((m) => {
                const r = roleConfig[m.role];
                return (
                  <TableRow key={m.email}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={m.initials} />
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.variant}>{r.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {m.lastActive}
                      </p>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {m.role !== "owner" ? (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Badge variant="outline">คุณ</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">คำเชิญที่ยังไม่ตอบรับ (2)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {["accountant@example.co.th", "ops@example.co.th"].map((e) => (
            <div
              key={e}
              className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{e}</span>
                <Badge variant="warning">รอตอบรับ</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  ส่งซ้ำ
                </Button>
                <Button variant="ghost" size="sm">
                  ยกเลิก
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

const apiKeys = [
  { id: "k1", name: "Production API", prefix: "sk_live_a8s9d", created: "2025-03-15", lastUsed: "5 นาทีที่แล้ว" },
  { id: "k2", name: "Staging API", prefix: "sk_test_zx3c4", created: "2025-04-22", lastUsed: "2 ชม.ที่แล้ว" },
];

const integrations = [
  { id: "customs", name: "Thai Customs e-Customs", desc: "ส่งใบขนสินค้าผ่าน Paperless System", icon: Globe, connected: true, status: "เชื่อมต่อแล้ว" },
  { id: "express", name: "FlowAccount", desc: "ส่งข้อมูล Invoice ไปที่ระบบบัญชี", icon: Receipt, connected: true, status: "เชื่อมต่อแล้ว" },
  { id: "maersk", name: "Maersk API", desc: "ดึงข้อมูล B/L อัตโนมัติ", icon: Building2, connected: false, status: "ยังไม่ได้เชื่อมต่อ" },
  { id: "slack", name: "Slack", desc: "ส่งการแจ้งเตือนไป channel", icon: Slack, connected: false, status: "ยังไม่ได้เชื่อมต่อ" },
];

function ApiTab() {
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              ใช้สำหรับเรียก API จากระบบของคุณ — เก็บเป็นความลับ
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            สร้าง Key ใหม่
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{k.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-xs font-mono text-muted-foreground">
                    {revealed[k.id]
                      ? `${k.prefix}_xxxxxxxxxxxxxxxxxxxxxxxx`
                      : `${k.prefix}••••••••••••••••••••••••`}
                  </code>
                  <button
                    onClick={() =>
                      setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {revealed[k.id] ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  สร้างเมื่อ {k.created} · ใช้งานล่าสุด {k.lastUsed}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            เชื่อมต่อกับระบบภายนอกเพื่อทำงานอัตโนมัติ
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {integrations.map((i) => {
            const Icon = i.icon;
            return (
              <div
                key={i.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md",
                    i.connected ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{i.name}</p>
                    {i.connected && (
                      <Badge variant="success" className="h-5">
                        เชื่อมต่อแล้ว
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {i.desc}
                  </p>
                  <Button
                    variant={i.connected ? "outline" : "default"}
                    size="sm"
                    className="mt-3"
                  >
                    {i.connected ? (
                      "จัดการ"
                    ) : (
                      <>
                        เชื่อมต่อ
                        <ExternalLink className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            รับ event เมื่อมี document, analysis, หรือ status เปลี่ยน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="webhook">URL ปลายทาง</Label>
            <div className="flex gap-2">
              <Input id="webhook" placeholder="https://api.yoursite.com/webhooks/customs" />
              <Button variant="outline">ทดสอบ</Button>
            </div>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
            <p className="font-mono">
              POST · Headers: <span className="text-foreground">X-Customs-Signature</span> (HMAC-SHA256)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

const channels = [
  { id: "email", name: "Email", desc: "patikorn@example.co.th", icon: Mail },
  { id: "line", name: "LINE Notify", desc: "เชื่อมต่อ token แล้ว", icon: MessageCircle },
  { id: "slack", name: "Slack", desc: "#customs-alerts", icon: Slack },
];

const events = [
  { key: "doc_done", label: "วิเคราะห์เอกสารเสร็จ", desc: "เมื่อ AI ประมวลผลเสร็จและพร้อมตรวจสอบ" },
  { key: "doc_review", label: "ต้องการตรวจโดยมนุษย์", desc: "เมื่อความมั่นใจ AI ต่ำกว่าเกณฑ์ที่กำหนด" },
  { key: "doc_failed", label: "เอกสารผิดพลาด", desc: "OCR ล้มเหลวหรือไฟล์อ่านไม่ออก" },
  { key: "credit_low", label: "เครดิตเหลือน้อย", desc: "เครดิตเหลือต่ำกว่า 10% ของแพ็กเกจ" },
  { key: "billing", label: "การเรียกเก็บเงิน", desc: "ใบแจ้งหนี้ใหม่หรือการชำระเงินผิดพลาด" },
];

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ช่องทางการแจ้งเตือน</CardTitle>
          <CardDescription>
            เลือกวิธีที่ระบบจะส่งการแจ้งเตือนถึงคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <Switch defaultChecked={c.id !== "slack"} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เลือก Event ที่ต้องการรับ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((e) => (
            <div
              key={e.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{e.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {e.desc}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

const invoices = [
  { id: "INV-202505", date: "2025-05-01", desc: "Pro Plan · พ.ค. 2568", amount: 3199, status: "paid" },
  { id: "INV-202504", date: "2025-04-01", desc: "Pro Plan · เม.ย. 2568", amount: 3199, status: "paid" },
  { id: "INV-202503", date: "2025-03-01", desc: "Pro Plan · มี.ค. 2568", amount: 3199, status: "paid" },
  { id: "INV-202502", date: "2025-02-01", desc: "Starter Plan · ก.พ. 2568", amount: 1060, status: "paid" },
  { id: "INV-202501", date: "2025-01-01", desc: "Starter Plan · ม.ค. 2568", amount: 1060, status: "paid" },
];

function InvoicesTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>ประวัติการชำระเงิน</CardTitle>
            <CardDescription>
              ดาวน์โหลดใบเสร็จและใบกำกับภาษีย้อนหลัง
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            ดาวน์โหลดทั้งหมด
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">เลขที่</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="pr-6 text-right">เอกสาร</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-6 font-mono text-xs">
                    {inv.id}
                  </TableCell>
                  <TableCell className="text-sm">{inv.desc}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.date}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatTHB(inv.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">ชำระแล้ว</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>วิธีการชำระเงินปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white">
              VISA
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">•••• •••• •••• 4242</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                หมดอายุ 12/27 · ปฏิกร ทวีสุข
              </p>
            </div>
            <Button variant="outline" size="sm">
              เปลี่ยน
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
