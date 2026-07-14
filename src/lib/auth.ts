import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  role: UserRole;
  name: string;
  email: string | null;
  phone: string | null;
  avatarColor: string;
}

// Reads the current authenticated user + profile fields from user metadata.
// (The `profiles` row is the source of truth once M3 lands; metadata keeps the
// header working before/without a profile lookup.)
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  let user;
  try {
    const supabase = await createClient();
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    // Supabase unreachable / not configured yet — treat as logged out.
    return null;
  }
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    role: (meta.role as UserRole) ?? "ORGANIZER",
    name: (meta.name as string) ?? user.email?.split("@")[0] ?? "Korisnik",
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatarColor: (meta.avatarColor as string) ?? "#5A4BE3",
  };
}

export function homePathForRole(role: UserRole): string {
  return role === "ORGANIZER" ? "/pretraga" : "/panel";
}
