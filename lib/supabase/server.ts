/**
 * Supabase client for use in SERVER components, route handlers,
 * and server actions. Reads/writes cookies through Next.js cookies().
 *
 * - Honors RLS — runs as the current user
 * - Use this in Server Components: `const supabase = createClient()`
 *   then `await supabase.auth.getUser()` etc.
 *
 * For background jobs that need to bypass RLS (e.g. extractor agent
 * reading any document) use `getSupabaseAdmin()` from `lib/supabase-admin.ts`.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — Next.js disallows
            // setting cookies there. Safe to ignore; middleware
            // refreshes the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // see above
          }
        },
      },
    }
  );
}
