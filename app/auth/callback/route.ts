/**
 * OAuth + email-verification callback.
 *
 * Supabase redirects here after the user:
 *   - clicks the magic link in their verification email
 *   - completes the OAuth flow (Google, LINE, ...)
 *
 * The query string contains a `code` we exchange for a session.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error)}`
    );
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  // First time the user has ever signed in? Create their org + profile.
  // Safe to call on every login — `bootstrap_org_for_user` is idempotent.
  if (data.user) {
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      data.user.email?.split("@")[0] ??
      null;
    const companyName = (meta.company_name as string | undefined) ?? null;

    const { error: bootstrapError } = await supabase.rpc("bootstrap_org_for_user", {
      p_user_id: data.user.id,
      p_email: data.user.email!,
      p_full_name: fullName,
      p_company_name: companyName,
    });

    if (bootstrapError) {
      // Don't block the redirect — just log. Dashboard will gracefully
      // show "—" for org if bootstrap somehow fails, and the user can
      // retry via /account.
      console.error("[auth/callback] bootstrap_org_for_user failed:", bootstrapError);
    }
  }

  // Don't let attackers redirect to external URLs
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
