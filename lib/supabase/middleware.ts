/**
 * Session-refresh helper for use inside `middleware.ts`.
 *
 * Why this exists: Supabase auth cookies have a short JWT TTL. Without
 * refreshing them on each request, users get logged out unexpectedly.
 * Calling this in middleware keeps the session alive transparently.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Trigger a session refresh if needed. The return value isn't used here —
  // the side-effect of cookie updates is what matters.
  const { data: { user } } = await supabase.auth.getUser();

  return { response, user };
}
