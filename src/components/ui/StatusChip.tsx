"use client";

import { STATUS_CHIP } from "@/lib/constants";
import { useT } from "@/i18n/provider";
import type { BookingStatus, Market } from "@/lib/types";

export function StatusChip({ status }: { status: BookingStatus }) {
  const t = useT();
  return <span className={`chip ${STATUS_CHIP[status]}`}>{t.statuses[status]}</span>;
}

export function MarketChip({ market }: { market: Market }) {
  const t = useT();
  const cls = market === "DIASPORA" ? "chip-diaspora" : "chip-neutral";
  return (
    <span className={`chip ${cls}`}>
      {market === "DIASPORA" ? "✈ " : ""}
      {t.markets[market]}
    </span>
  );
}

export function VerifiedChip() {
  const t = useT();
  return (
    <span className="chip chip-verified" title={t.common.verified}>
      ✓ {t.common.verified}
    </span>
  );
}
