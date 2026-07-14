import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { UserRole } from "@/lib/types";

// Google OAuth callback: exchanges the code for a session, then stamps the
// selected role (from the signup cookie) for first-time users.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/prijava?error=oauth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/prijava?error=oauth`);
  }

  const cookieStore = await cookies();
  const intendedRole =
    (cookieStore.get("gaza_signup_role")?.value as UserRole | undefined) ?? undefined;

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

  cookieStore.delete("gaza_signup_role");
  const home = role === "ORGANIZER" ? "/pretraga" : "/panel";
  return NextResponse.redirect(`${origin}${home}`);
}
