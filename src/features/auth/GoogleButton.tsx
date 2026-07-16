"use client";

import { useState } from "react";
import { startGoogleAuth } from "./actions";
import { useT } from "@/i18n/provider";
import type { UserRole } from "@/lib/types";

export function GoogleButton({ role }: { role: UserRole }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await startGoogleAuth(role);
    if (res.url) {
      window.location.href = res.url;
    } else {
      setError(res.error ?? t.auth.googleNotConfigured);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="btn-secondary w-full"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 002.18 6.94l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z"
          />
        </svg>
        {t.auth.google}
      </button>
      {error && <p className="mt-2 text-xs text-coral">{error}</p>}
    </div>
  );
}
