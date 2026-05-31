import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireUser, getCurrentOrg, getInitials } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AccountTabs } from "./account-tabs";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const org = await getCurrentOrg();

  // Pull extras (phone) from user_profiles + job_title from user_metadata
  const supabase = createClient();
  const { data: profileExtras } = await supabase
    .from("user_profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const metadata = (authUser?.user_metadata ?? {}) as Record<string, unknown>;
  const jobTitle = (metadata.job_title as string | undefined) ?? "";
  const emailVerified = !!authUser?.email_confirmed_at;

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

      <AccountTabs
        profile={{
          email: user.email,
          emailVerified,
          fullName: user.full_name ?? "",
          phone: profileExtras?.phone ?? "",
          jobTitle,
          initials: getInitials(user.full_name ?? user.email),
          orgName: org?.name ?? null,
          orgRole: org?.role ?? null,
        }}
      />
    </div>
  );
}
