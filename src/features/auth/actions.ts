"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";
import { avatarColorFor } from "./avatarColor";
import type { UserRole } from "@/lib/types";

export interface AuthResult {
  ok: boolean;
  error?: string;
  // For phone flow the client advances to the code step.
  step?: "code";
}

const ROLE_HOME: Record<UserRole, string> = {
  ORGANIZER: "/pretraga",
  ARTIST: "/panel",
  MANAGER: "/panel",
};

function normalizeRole(raw: FormDataEntryValue | null): UserRole {
  // Registration offers two buckets: "Izvođač/Menadžer" or "Naručilac".
  // We store MANAGER for the supply side by default (can add artists), ORGANIZER for demand.
  const v = String(raw ?? "");
  if (v === "ORGANIZER") return "ORGANIZER";
  if (v === "ARTIST") return "ARTIST";
  return "MANAGER";
}

// --- Email + password ---
export async function signUpWithEmail(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = normalizeRole(formData.get("role"));

  const { t } = await getT();
  if (!email || !password || !name) {
    return { ok: false, error: t.auth.errFillNameEmailPass };
  }
  if (password.length < 6) {
    return { ok: false, error: t.auth.errPasswordShort };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, avatarColor: avatarColorFor(name) },
    },
  });
  if (error) return { ok: false, error: error.message };

  redirect(ROLE_HOME[role]);
}

export async function signInWithEmail(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { t } = await getT();
  if (!email || !password) {
    return { ok: false, error: t.auth.errFillEmailPass };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { ok: false, error: error.message };

  const role = (data.user?.user_metadata?.role as UserRole) ?? "ORGANIZER";
  redirect(ROLE_HOME[role]);
}

// --- Phone OTP (dev stub — spec §3) ---
export async function sendPhoneOtp(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const phone = String(formData.get("phone") ?? "").trim();
  const { t } = await getT();
  if (!phone) return { ok: false, error: t.auth.errPhone };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });

  // In local dev without an SMS provider, GoTrue's `test_otp` (config.toml)
  // returns the fixed code. We surface a hint either way.
  if (error) {
    // eslint-disable-next-line no-console
    console.log(
      `[DEV OTP] SMS provajder nije podešen. Koristi test kod ${process.env.NEXT_PUBLIC_DEV_OTP ?? "123456"} za demo brojeve (vidi supabase/config.toml).`,
    );
    return { ok: false, error: t.auth.errSmsNotConfigured };
  }
  return { ok: true, step: "code" };
}

export async function verifyPhoneOtp(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = normalizeRole(formData.get("role"));

  const { t } = await getT();
  if (!token) return { ok: false, error: t.auth.errEnterCode };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  if (error) return { ok: false, error: error.message };

  // First login via phone -> stamp profile metadata if missing.
  if (data.user && !data.user.user_metadata?.role) {
    await supabase.auth.updateUser({
      data: {
        name: name || `Korisnik ${phone.slice(-4)}`,
        role,
        avatarColor: avatarColorFor(phone),
      },
    });
  }
  const resolvedRole =
    (data.user?.user_metadata?.role as UserRole) ?? role ?? "ORGANIZER";
  redirect(ROLE_HOME[resolvedRole]);
}

// --- Google OAuth ---
// Stores the intended role in a cookie so the callback can stamp it for new users.
export async function startGoogleAuth(role: UserRole): Promise<{ url?: string; error?: string }> {
  const cookieStore = await cookies();
  cookieStore.set("gaza_signup_role", role, {
    maxAge: 600,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  return { url: data.url };
}
