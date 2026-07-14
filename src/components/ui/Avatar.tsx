interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-xl",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, color = "#5A4BE3", size = "md" }: AvatarProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${SIZES[size]}`}
      style={{ background: color }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
