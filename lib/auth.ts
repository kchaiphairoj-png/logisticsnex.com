/**
 * Server-only auth helpers. Use these inside Server Components and route handlers.
 *
 * - `getCurrentUser()` returns the authenticated user + their default profile
 * - `requireUser()` redirects to /sign-in if no session exists
 * - `getCurrentOrg()` returns the user's "current" organization
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  default_org_id: string | null;
}

export interface CurrentOrg {
  id: string;
  name: string;
  slug: string;
  role: string;
  status: string;
}

/**
 * Returns the authenticated user joined with their `user_profiles` row.
 * Returns null if no session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url, default_org_id")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    default_org_id: profile?.default_org_id ?? null,
  };
}

/**
 * Like `getCurrentUser()` but redirects to /sign-in if no session.
 * Use this in pages that absolutely require a user.
 */
export async function requireUser(redirectTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = redirectTo
      ? `?next=${encodeURIComponent(redirectTo)}`
      : "";
    redirect(`/sign-in${next}`);
  }
  return user;
}

/**
 * Returns the user's current organization (the one set as `default_org_id`
 * on their profile, or the first one they belong to).
 */
export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();

  // Prefer the user's default org
  if (user.default_org_id) {
    const { data } = await supabase
      .from("organizations")
      .select("id, name, slug, status, organization_members!inner(role)")
      .eq("id", user.default_org_id)
      .eq("organization_members.user_id", user.id)
      .single();
    if (data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        status: data.status,
        role: (data.organization_members as any)[0]?.role ?? "member",
      };
    }
  }

  // Fall back to first membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug, status)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership?.organizations) return null;
  const org = membership.organizations as any;
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    status: org.status,
    role: membership.role,
  };
}

/**
 * Get user initials for avatar fallback.
 * "ปฏิกร ทวีสุข" → "ปท"
 * "Patikorn Thavisuk" → "PT"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
