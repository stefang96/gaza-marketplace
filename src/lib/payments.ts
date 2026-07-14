import type { SupabaseClient } from "@supabase/supabase-js";
import type { EscrowState } from "./types";

/**
 * Payment / escrow abstraction (spec §7).
 *
 * Za MVP je SVE simulirano: nema pravog PSP-a ni kartičnih podataka. Ovaj
 * interfejs je granica koju kasnije zamenjuje pravi provajder (Stripe Connect
 * ili regionalni PSP) BEZ menjanja UI-a.
 */
export interface PaymentProvider {
  createDeposit(bookingId: string, amount: number): Promise<void>;
  holdInEscrow(bookingId: string): Promise<void>;
  release(bookingId: string): Promise<void>;
  refund(bookingId: string): Promise<void>;
}

async function setEscrow(
  supabase: SupabaseClient,
  bookingId: string,
  state: EscrowState,
) {
  const { error } = await supabase
    .from("booking_requests")
    .update({ escrow_state: state })
    .eq("id", bookingId);
  if (error) throw error;
}

// Mock provider — only flips escrow_state and logs. No money moves.
export class MockPaymentProvider implements PaymentProvider {
  constructor(private supabase: SupabaseClient) {}

  async createDeposit(bookingId: string, amount: number): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[MOCK PAY] createDeposit(${bookingId}, ${amount} EUR) — simulirano`);
  }

  async holdInEscrow(bookingId: string): Promise<void> {
    await setEscrow(this.supabase, bookingId, "DEPOSIT_HELD");
    // eslint-disable-next-line no-console
    console.log(`[MOCK PAY] holdInEscrow(${bookingId}) -> DEPOSIT_HELD`);
  }

  async release(bookingId: string): Promise<void> {
    await setEscrow(this.supabase, bookingId, "RELEASED");
    // eslint-disable-next-line no-console
    console.log(`[MOCK PAY] release(${bookingId}) -> RELEASED`);
  }

  async refund(bookingId: string): Promise<void> {
    await setEscrow(this.supabase, bookingId, "REFUNDED");
    // eslint-disable-next-line no-console
    console.log(`[MOCK PAY] refund(${bookingId}) -> REFUNDED`);
  }
}

export function getPaymentProvider(supabase: SupabaseClient): PaymentProvider {
  // TODO: swap for StripeConnectProvider / regional PSP behind the same interface.
  return new MockPaymentProvider(supabase);
}
