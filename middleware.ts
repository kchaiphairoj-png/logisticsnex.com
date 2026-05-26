import { NextResponse, type NextRequest } from "next/server";

/**
 * Route gating for LogisticsNex.
 *
 * Public:        /, /sign-in, /sign-up, /robots.txt, /sitemap.xml, /api/health
 * Protected:     /dashboard, /upload, /analysis, /marketplace, /billing,
 *                /settings, /account, /api/ai/*
 *
 * ──────────────────────────────────────────────────────────────────
 * TODO before going live: swap the cookie sniff below for a real
 * session check using `@supabase/ssr` createServerClient:
 *
 *   import { createServerClient } from "@supabase/ssr";
 *   const supabase = createServerClient(URL, ANON_KEY, { cookies: { ... }});
 *   const { data: { user } } = await supabase.auth.getUser();
 *
 * Until then, the cookie check only verifies that *some* Supabase auth
 * cookie exists — it does NOT validate the JWT. Good enough to keep
 * dashboard hidden from anonymous visitors but NOT a security boundary.
 * The real security boundary is the RLS policies on every table.
 * ──────────────────────────────────────────────────────────────────
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/upload",
  "/analysis",
  "/marketplace",
  "/billing",
  "/settings",
  "/account",
  "/api/ai",
];

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function hasSupabaseSession(req: NextRequest): boolean {
  // Supabase auth cookies follow the pattern `sb-<project-ref>-auth-token`
  // or split chunks `sb-<ref>-auth-token.0`, `.1`, etc.
  for (const cookie of req.cookies.getAll()) {
    if (/^sb-.+-auth-token(\.\d+)?$/.test(cookie.name) && cookie.value) {
      return true;
    }
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = hasSupabaseSession(req);

  // Protected route + no session → bounce to sign-in
  if (isProtected(pathname) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Auth page + already signed in → go to dashboard
  if (AUTH_PAGES.includes(pathname) && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|manifest.webmanifest|opengraph-image|robots.txt|sitemap.xml).*)",
  ],
};
