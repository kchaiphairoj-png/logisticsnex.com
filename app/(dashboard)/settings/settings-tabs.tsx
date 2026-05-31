"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Building2,
  Users,
  Key,
  Bell,
  Receipt,
  Plus,
  Mail,
  Slack,
  MessageCircle,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
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
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateOrganization,
  type UpdateOrgState,
} from "@/lib/actions/organization";

export type OrgData = {
  id: string;
  name: string;
  tax_id: string | null;
  country: string;
  billing_email: string;
  status: string;
  role: string;
};

export type TeamMember = {
  user_id: string;
  full_name: string | null;
  email: string;
  initials: string;
  role: string;
  joined_at: string;
  is_current: boolean;
};

export function SettingsTabs({
  org,
  members,
  canEditOrg,
}: {
  org: OrgData | null;
  members: TeamMember[];
  canEditOrg: boolean;
}) {
  return (
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
        <TabsTrigger value="notifications">
          <Bell className="h-3.5 w-3.5 mr-1.5" />
          การแจ้งเตือน
        </TabsTrigger>
        <TabsTrigger value="invoices">
          <Receipt className="h-3.5 w-3.5 mr-1.5" />
          ประวัติการชำระเงิน
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralTab org={org} canEdit={canEditOrg} />
      </TabsContent>
      <TabsContent value="team">
        <TeamTab members={members} canManage={canEditOrg} />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoicesTab />
      </TabsContent>
    </Tabs>
  );
}

/* ─── General tab (real data + Server Action) ──────────────── */

function GeneralTab({ org, canEdit }: { org: OrgData | null; canEdit: boolean }) {
  const [state, action] = useFormState<UpdateOrgState | undefined, FormData>(
    updateOrganization,
    undefined
  );

  if (!org) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          ไม่พบข้อมูลองค์กรของคุณ
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="org_id" value={org.id} />

      {state && (
        <div
          className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : "border-rose-500/30 bg-rose-500/5 text-rose-400"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <p>{state.message}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลองค์กร</CardTitle>
          <CardDescription>
            ใช้สำหรับออกใบกำกับภาษีและยื่นเอกสารต่อกรมศุลกากร
            {!canEdit && (
              <span className="block mt-1 text-amber-400">
                เฉพาะ owner/admin เท่านั้นที่แก้ไขได้
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อองค์กร</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={org.name}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                id="tax_id"
                name="tax_id"
                placeholder="0-1234-56789-01-2"
                defaultValue={org.tax_id ?? ""}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billing_email">อีเมลออกใบกำกับ</Label>
              <Input
                id="billing_email"
                name="billing_email"
                type="email"
                required
                defaultValue={org.billing_email}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">ประเทศ</Label>
              <Select
                id="country"
                name="country"
                defaultValue={org.country}
                disabled={!canEdit}
                className="h-10"
              >
                <option value="TH">🇹🇭 ไทย</option>
                <option value="SG">🇸🇬 สิงคโปร์</option>
                <option value="MY">🇲🇾 มาเลเซีย</option>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant={org.status === "active" ? "success" : org.status === "trial" ? "info" : "warning"}>
              {org.status === "trial" ? "ทดลองใช้" : org.status === "active" ? "ใช้งานอยู่" : org.status}
            </Badge>
            <span>Org ID: <code className="font-mono">{org.id.slice(0, 8)}…</code></span>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end gap-2">
          <Button type="reset" variant="outline">
            ยกเลิก
          </Button>
          <SaveButton />
        </div>
      )}
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          กำลังบันทึก...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          บันทึก
        </>
      )}
    </Button>
  );
}

/* ─── Team tab (real members from DB) ──────────────────────── */

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  owner: { label: "Owner", variant: "default" },
  admin: { label: "Admin", variant: "secondary" },
  member: { label: "Member", variant: "outline" },
  viewer: { label: "Viewer", variant: "outline" },
};

function TeamTab({ members, canManage }: { members: TeamMember[]; canManage: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>สมาชิกทีม</CardTitle>
            <CardDescription>
              {members.length} สมาชิก
            </CardDescription>
          </div>
          {canManage && (
            <Button size="sm" disabled title="ฟีเจอร์เชิญสมาชิกจะเปิดในรอบถัดไป">
              <Plus className="h-3.5 w-3.5" />
              เชิญสมาชิก
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              ยังไม่มีสมาชิกในองค์กร
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">สมาชิก</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>เข้าร่วมเมื่อ</TableHead>
                  <TableHead className="pr-6 text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const r = roleConfig[m.role] ?? roleConfig.member;
                  return (
                    <TableRow key={m.user_id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={m.initials} />
                          <div>
                            <p className="text-sm font-medium">
                              {m.full_name ?? m.email}
                              {m.is_current && (
                                <span className="ml-2 text-xs text-muted-foreground">(คุณ)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.variant}>{r.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {new Date(m.joined_at).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {m.role !== "owner" && canManage ? (
                          <Button variant="ghost" size="sm" disabled>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Badge variant="outline">—</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Notifications + Invoices: still placeholder ──────────── */

const channels = [
  { id: "email", name: "Email", desc: "ผ่าน Supabase Auth (email ที่สมัครไว้)", icon: Mail },
  { id: "line", name: "LINE Notify", desc: "ยังไม่เชื่อมต่อ", icon: MessageCircle },
  { id: "slack", name: "Slack", desc: "ยังไม่เชื่อมต่อ", icon: Slack },
];

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ช่องทางการแจ้งเตือน</CardTitle>
          <CardDescription>
            เลือกวิธีที่ระบบจะส่งการแจ้งเตือนถึงคุณ (ฟีเจอร์เต็มจะเปิดในรอบถัดไป)
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
                <Switch defaultChecked={c.id === "email"} disabled />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function InvoicesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติการชำระเงิน</CardTitle>
        <CardDescription>
          ดาวน์โหลดใบเสร็จและใบกำกับภาษีย้อนหลัง
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-10 text-center text-sm text-muted-foreground">
          <Receipt className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          ยังไม่มีประวัติการชำระเงิน
          <p className="mt-1 text-xs">
            เมื่อสมัครแพ็กเกจที่ /billing ใบกำกับภาษีจะแสดงที่นี่
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
