import { COMMISSION_RATE } from "./constants";
import type { Market } from "./types";

export interface FeeBreakdown {
  feeArtist: number;
  logisticsFee: number;
  commission: number;
  feeTotal: number;
}

// Flat logistics estimate for diaspora gigs (transport + stay + papers).
// A real quote would depend on distance/crew size — TODO when logistics is built out.
function estimateLogistics(market: Market): number {
  return market === "DIASPORA" ? 500 : 0;
}

export function computeFees(priceFrom: number, market: Market): FeeBreakdown {
  const feeArtist = priceFrom;
  const logisticsFee = estimateLogistics(market);
  const commission = Math.round(feeArtist * COMMISSION_RATE);
  const feeTotal = feeArtist + logisticsFee + commission;
  return { feeArtist, logisticsFee, commission, feeTotal };
}
