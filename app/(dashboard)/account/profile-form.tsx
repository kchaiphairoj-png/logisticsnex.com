"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateProfile, type UpdateProfileState } from "@/lib/actions/account";

export interface ProfileFormProps {
  email: string;
  emailVerified: boolean;
  fullName: string;
  phone: string;
  jobTitle: string;
  initials: string;
  orgName: string | null;
  orgRole: string | null;
}

export function ProfileForm(props: ProfileFormProps) {
  const [state, action] = useFormState<UpdateProfileState | undefined, FormData>(
    updateProfile,
    undefined
  );

  // Split name into first + last for the two input boxes
  const [firstName, lastName] = splitName(props.fullName || "");
  const [fname, setFname] = React.useState(firstName);
  const [lname, setLname] = React.useState(lastName);

  // Keep a hidden field with the combined full_name in sync
  const combinedName = [fname.trim(), lname.trim()].filter(Boolean).join(" ");

  return (
    <form action={action} className="space-y-6">
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
                {props.initials}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border hover:bg-accent"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-semibold">{combinedName || props.email}</h3>
              <p className="text-sm text-muted-foreground">
                {props.orgRole === "owner" ? "Owner" : props.orgRole ?? "Member"}
                {props.orgName ? ` · ${props.orgName}` : ""}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Button type="button" variant="outline" size="sm">
                  เปลี่ยนรูปภาพ
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  ลบ
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Form */}
          <input type="hidden" name="full_name" value={combinedName} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fname">ชื่อ</Label>
              <Input
                id="fname"
                required
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lname">นามสกุล</Label>
              <Input
                id="lname"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  อีเมล
                </span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  defaultValue={props.email}
                  disabled
                  className="opacity-70"
                />
                {props.emailVerified ? (
                  <Badge variant="success" className="self-center shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    ยืนยันแล้ว
                  </Badge>
                ) : (
                  <Badge variant="warning" className="self-center shrink-0">
                    รอยืนยัน
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                เปลี่ยน email ผ่าน Supabase Auth — ติดต่อ admin
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  เบอร์โทรศัพท์
                </span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="081-234-5678"
                defaultValue={props.phone}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job_title">ตำแหน่ง</Label>
              <Input
                id="job_title"
                name="job_title"
                placeholder="Import Manager"
                defaultValue={props.jobTitle}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline">
          ยกเลิก
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
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

function splitName(full: string): [string, string] {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return [parts[0] ?? "", ""];
  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return [first, last];
}
