import type { Genre } from "@/lib/types";

// Per-genre gradient so every artist gets attractive, on-brand cover art
// without needing a real photo. Pure SVG — renders in server components.
const GENRE_GRADIENT: Record<Genre, [string, string]> = {
  NAROD: ["#E8A21E", "#E4553B"],
  TRUBACI: ["#EAB308", "#B45309"],
  COVER: ["#6455EA", "#3B62D6"],
  DJ: ["#7A5AF8", "#22B8B0"],
  POPFOLK: ["#EC4899", "#7A5AF8"],
  TAMBURASI: ["#16A46E", "#0E9488"],
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ArtistCover({
  name,
  genre,
  className = "h-52 w-full",
}: {
  name: string;
  genre: Genre;
  className?: string;
}) {
  const [c1, c2] = GENRE_GRADIENT[genre] ?? GENRE_GRADIENT.COVER;
  const gid = `cov-${genre}`;

  return (
    <svg
      viewBox="0 0 400 208"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="400" y2="208" gradientUnits="userSpaceOnUse">
          <stop stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="0.2" cy="0.15" r="0.9">
          <stop stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="208" fill={`url(#${gid})`} />
      <rect width="400" height="208" fill={`url(#${gid}-glow)`} />

      {/* faint equalizer motif (echoes the logo) */}
      <g fill="#ffffff" opacity="0.16">
        {[
          [250, 120, 70],
          [278, 90, 118],
          [306, 60, 148],
          [334, 100, 108],
          [362, 140, 68],
        ].map(([x, h, y], i) => (
          <rect key={i} x={x} y={y} width="16" height={h} rx="8" />
        ))}
      </g>

      {/* initials */}
      <text
        x="32"
        y="128"
        fill="#ffffff"
        fillOpacity="0.96"
        fontSize="88"
        fontWeight="700"
        fontFamily="var(--font-display), ui-sans-serif, system-ui, sans-serif"
        letterSpacing="-2"
      >
        {initials(name)}
      </text>
    </svg>
  );
}
