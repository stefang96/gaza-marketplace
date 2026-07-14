interface StarsProps {
  value: number;
  count?: number;
  showValue?: boolean;
}

// Rating uses amber per spec §8 (ocena-zvezdice).
export function Stars({ value, count, showValue = true }: StarsProps) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber" aria-hidden>
        ★
      </span>
      {showValue && <span className="font-semibold text-ink">{rounded.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-muted">({count})</span>
      )}
    </span>
  );
}
