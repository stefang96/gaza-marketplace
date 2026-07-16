import Link from "next/link";

// Brand mark: an equalizer/sound motif in an indigo badge (spec §8 palette).
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="gaza-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6455EA" />
          <stop offset="1" stopColor="#4737C4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#gaza-mark)" />
      <g fill="#fff">
        <rect x="6.6" y="11" width="3" height="10" rx="1.5" opacity="0.85" />
        <rect x="11.9" y="7" width="3" height="18" rx="1.5" />
        <rect x="17.2" y="9.5" width="3" height="13" rx="1.5" opacity="0.92" />
        <rect x="22.5" y="13" width="3" height="6" rx="1.5" opacity="0.8" />
      </g>
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <LogoMark size={32} />
      <span className="font-display text-xl font-bold tracking-tight text-ink">Gaža</span>
    </Link>
  );
}
