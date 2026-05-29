import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Route gating for LogisticsNex with Supabase Auth.
 *
 * Public:        /, /sign-in, /sign-up, /robots.txt, /sitemap.xml, /api/health
 * Protected:     /dashboard, /upload, /analysis, /marketplace, /billing,
 *                /settings, /account, /api/ai/*
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always refresh the Supabase session first — this also lets us know
  // who the user is for the routing decisions below.
  const { response, user } = await updateSession(req);
  const authed = !!user;

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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|manifest.webmanifest|opengraph-image|robots.txt|sitemap.xml).*)",
  ],
};
