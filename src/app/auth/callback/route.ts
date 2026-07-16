import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { UserRole } from "@/lib/types";

// Google OAuth callback: exchanges the code for a session, then stamps the
// selected role (passed as ?role= from the sign-in button) for first-time users.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");

  if (providerError || !code) {
    // eslint-disable-next-line no-console
    console.error("[oauth callback] missing code / provider error:", providerError);
    return NextResponse.redirect(`${origin}/prijava?error=oauth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[oauth callback] exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/prijava?error=oauth`);
  }

  const intendedRole = (searchParams.get("role") as UserRole | null) ?? undefined;
  const user = data.user;
  let role = (user?.user_metadata?.role as UserRole) ?? undefined;

  if (user && !role) {
    role = intendedRole ?? "ORGANIZER";
    await supabase.auth.updateUser({
      data: {
        role,
        name:
          (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          user.email?.split("@")[0] ??
          "Korisnik",
        avatarColor: avatarColorFor(user.email ?? user.id),
      },
    });
  }

  const home = role === "ORGANIZER" ? "/pretraga" : "/panel";
  return NextResponse.redirect(`${origin}${home}`);
}
