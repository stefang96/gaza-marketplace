"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payDeposit, confirmPerformed, cancelBooking } from "./actions";
import { formatEur } from "@/lib/constants";
import type { BookingStatus, EscrowState } from "@/lib/types";
import { organizerActions } from "@/lib/booking";

export function BookingActions({
  bookingId,
  status,
  escrowState,
  date,
  feeTotal,
}: {
  bookingId: string;
  status: BookingStatus;
  escrowState: EscrowState;
  date: string;
  feeTotal: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { canPayDeposit, canConfirmDone, canCancel } = organizerActions({
    status,
    escrowState,
    date,
  });

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Došlo je do greške.");
      else router.refresh();
    });
  }

  if (!canPayDeposit && !canConfirmDone && !canCancel) {
    return (
      <p className="text-sm text-muted">
        Nema dostupnih akcija za trenutni status.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {canPayDeposit && (
        <button
          onClick={() => run(() => payDeposit(bookingId))}
          disabled={pending}
          className="btn-primary w-full py-3"
        >
          {pending ? "Obrađujem…" : `Uplati kaparu u escrow · ${formatEur(feeTotal)}`}
        </button>
      )}
      {canConfirmDone && (
        <button
          onClick={() => run(() => confirmPerformed(bookingId))}
          disabled={pending}
          className="btn w-full bg-green py-3 text-white hover:brightness-95"
        >
          {pending ? "Obrađujem…" : "Potvrdi da je odsvirano — pusti isplatu"}
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => run(() => cancelBooking(bookingId))}
          disabled={pending}
          className="btn-danger w-full"
        >
          Otkaži upit
        </button>
      )}
      {error && <p className="text-sm text-coral">{error}</p>}
      <p className="text-center text-xs text-muted">
        Escrow i uplate su simulirani u ovoj verziji.
      </p>
    </div>
  );
}
