"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payDeposit, confirmPerformed, cancelBooking } from "./actions";
import { formatEur } from "@/lib/constants";
import { useT } from "@/i18n/provider";
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
  const t = useT();
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
    return <p className="text-sm text-muted">{t.bookingDetail.noActions}</p>;
  }

  return (
    <div className="space-y-3">
      {canPayDeposit && (
        <button
          onClick={() => run(() => payDeposit(bookingId))}
          disabled={pending}
          className="btn-primary w-full py-3"
        >
          {pending
            ? t.common.processing
            : `${t.bookingDetail.payDeposit} · ${formatEur(feeTotal)}`}
        </button>
      )}
      {canConfirmDone && (
        <button
          onClick={() => run(() => confirmPerformed(bookingId))}
          disabled={pending}
          className="btn w-full bg-green py-3 text-white hover:brightness-95"
        >
          {pending ? t.common.processing : t.bookingDetail.confirmPerformed}
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => run(() => cancelBooking(bookingId))}
          disabled={pending}
          className="btn-danger w-full"
        >
          {t.bookingDetail.cancelRequest}
        </button>
      )}
      {error && <p className="text-sm text-coral">{error}</p>}
      <p className="text-center text-xs text-muted">{t.common.simulatedNote}</p>
    </div>
  );
}
