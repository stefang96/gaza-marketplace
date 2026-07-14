import { STATUS_CHIP, STATUS_LABELS, MARKET_LABELS } from "@/lib/constants";
import type { BookingStatus, Market } from "@/lib/types";

export function StatusChip({ status }: { status: BookingStatus }) {
  return <span className={`chip ${STATUS_CHIP[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function MarketChip({ market }: { market: Market }) {
  const cls = market === "DIASPORA" ? "chip-diaspora" : "chip-neutral";
  return (
    <span className={`chip ${cls}`}>
      {market === "DIASPORA" ? "✈ " : ""}
      {MARKET_LABELS[market]}
    </span>
  );
}

export function VerifiedChip() {
  return (
    <span className="chip chip-verified" title="Verifikovan izvođač">
      ✓ Verifikovan
    </span>
  );
}
