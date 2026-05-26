"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  History,
  Settings,
  UserCircle,
  Sparkles,
  LogOut,
  CreditCard,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "หน้าแรก", icon: LayoutDashboard },
  { href: "/upload", label: "อัปโหลดเอกสาร", icon: Upload, badge: "3" },
  { href: "/analysis", label: "ประวัติภาษี & HS Code", icon: History },
  { href: "/marketplace", label: "B2B Marketplace", icon: Store, badge: "ใหม่" },
  { href: "/billing", label: "ชำระเงิน & แพ็กเกจ", icon: CreditCard },
  { href: "/settings", label: "การตั้งค่า", icon: Settings },
  { href: "/account", label: "บัญชีผู้ใช้", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">
            LogisticsNex
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            AI Trade Platform
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          เมนูหลัก
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "inline-flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold",
                    item.badge === "ใหม่"
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground min-w-[20px]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User panel */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer">
          <Avatar fallback="ปท" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">ปฏิกร ทวีสุข</p>
            <p className="truncate text-xs text-muted-foreground">Pro Plan</p>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
