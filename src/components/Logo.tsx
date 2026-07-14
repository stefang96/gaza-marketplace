import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white"
        style={{ background: "var(--accent)" }}
        aria-hidden
      >
        {/* stylized note */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18V5l10-2v13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" fill="white" />
          <circle cx="16" cy="16" r="3" fill="white" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold text-ink">Gaža</span>
    </Link>
  );
}
