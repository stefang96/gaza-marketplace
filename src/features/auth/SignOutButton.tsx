"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ title = "Odjava" }: { title?: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={signOut} className="btn-ghost" title={title} aria-label={title}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M16 17l5-5-5-5M21 12H9M12 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
