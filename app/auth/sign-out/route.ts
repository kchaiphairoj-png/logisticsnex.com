/**
 * Sign-out endpoint. POSTed from the sidebar sign-out button.
 *
 * Always returns a redirect to `/` even on error — bad UX to leave
 * the user stuck on a signed-in page when they meant to leave.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}

// Allow GET for convenience (e.g. linking from email)
export async function GET(request: NextRequest) {
  return POST(request);
}
