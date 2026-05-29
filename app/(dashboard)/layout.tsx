import * as React from "react";
import { Sidebar, type SidebarUser } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentUser, getCurrentOrg, getInitials } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already gates these routes, but fetching here gives us
  // the user + org for the sidebar without a second roundtrip.
  const [user, org] = await Promise.all([getCurrentUser(), getCurrentOrg()]);

  const sidebarUser: SidebarUser | undefined = user
    ? {
        full_name: user.full_name,
        email: user.email,
        initials: getInitials(user.full_name ?? user.email),
        org_name: org?.name ?? null,
        org_role: org?.role ?? null,
      }
    : undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={sidebarUser} />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
