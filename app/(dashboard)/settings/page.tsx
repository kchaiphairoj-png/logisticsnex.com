import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireUser, getCurrentOrg, getInitials } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsTabs, type OrgData, type TeamMember } from "./settings-tabs";

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const currentOrg = await getCurrentOrg();
  const supabase = createClient();

  let orgData: OrgData | null = null;
  let members: TeamMember[] = [];

  if (currentOrg) {
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("id, name, tax_id, country, billing_email, status")
      .eq("id", currentOrg.id)
      .maybeSingle();

    if (orgRow) {
      orgData = {
        id: orgRow.id,
        name: orgRow.name,
        tax_id: orgRow.tax_id,
        country: orgRow.country ?? "TH",
        billing_email: orgRow.billing_email,
        status: orgRow.status,
        role: currentOrg.role,
      };
    }

    // Join organization_members + user_profiles to get display names.
    // Email lives in auth.users which RLS hides — use stored full_name +
    // fall back to "user-{id-prefix}" for new members without profiles.
    const { data: memberRows } = await supabase
      .from("organization_members")
      .select(
        "user_id, role, joined_at, user_profiles!inner(full_name)"
      )
      .eq("org_id", currentOrg.id)
      .order("joined_at", { ascending: true });

    members = (memberRows ?? []).map((m: any) => {
      const fullName = m.user_profiles?.full_name ?? null;
      const isCurrent = m.user_id === user.id;
      const email = isCurrent ? user.email : "—";
      return {
        user_id: m.user_id,
        full_name: fullName,
        email,
        initials: getInitials(fullName ?? email),
        role: m.role,
        joined_at: m.joined_at,
        is_current: isCurrent,
      } as TeamMember;
    });
  }

  const canEditOrg = currentOrg?.role === "owner" || currentOrg?.role === "admin";

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
          จัดการองค์กร, สมาชิก, การแจ้งเตือน
        </p>
      </div>

      <SettingsTabs org={orgData} members={members} canEditOrg={!!canEditOrg} />
    </div>
  );
}
