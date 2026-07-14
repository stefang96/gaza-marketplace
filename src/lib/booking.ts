import type { BookingStatus, EscrowState } from "./types";

/**
 * Booking + escrow state machine (spec §6).
 *
 *  status: NEW → PENDING_CONFIRM → CONFIRMED → COMPLETED
 *                              ↘ DECLINED / CANCELLED
 *  escrow: NONE → DEPOSIT_HELD → RELEASED
 *                              ↘ REFUNDED
 */

// Escrow stepper model, shared by both organizer and manager views.
export interface EscrowStep {
  key: "deposit" | "performance" | "payout";
  label: string;
  state: "done" | "active" | "todo" | "cancelled";
}

export function escrowSteps(b: {
  status: BookingStatus;
  escrowState: EscrowState;
}): EscrowStep[] {
  const { status, escrowState } = b;
  const cancelled = status === "CANCELLED" || status === "DECLINED";

  const depositDone = escrowState === "DEPOSIT_HELD" || escrowState === "RELEASED";
  const performed = status === "COMPLETED";
  const released = escrowState === "RELEASED";

  return [
    {
      key: "deposit",
      label: "Kapara u escrow-u",
      state: cancelled && !depositDone ? "cancelled" : depositDone ? "done" : "active",
    },
    {
      key: "performance",
      label: "Nastup",
      state: cancelled ? "cancelled" : performed ? "done" : depositDone ? "active" : "todo",
    },
    {
      key: "payout",
      label: "Isplata izvođaču",
      state: cancelled ? "cancelled" : released ? "done" : performed ? "active" : "todo",
    },
  ];
}

// Which organizer-side actions are allowed for a given booking.
export function organizerActions(b: {
  status: BookingStatus;
  escrowState: EscrowState;
  date: string;
}) {
  const canPayDeposit = b.status === "CONFIRMED" && b.escrowState === "NONE";
  const canConfirmDone =
    b.status === "CONFIRMED" && b.escrowState === "DEPOSIT_HELD";
  const canCancel =
    b.status !== "COMPLETED" &&
    b.status !== "CANCELLED" &&
    b.status !== "DECLINED";
  return { canPayDeposit, canConfirmDone, canCancel };
}
