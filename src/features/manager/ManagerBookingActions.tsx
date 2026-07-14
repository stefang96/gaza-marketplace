"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptRequest,
  declineRequest,
  proposeChange,
  confirmPerformedByManager,
  markSeen,
  type ActionResult,
} from "./actions";
import type { BookingStatus, EscrowState } from "@/lib/types";

// Marks a NEW request as seen (-> PENDING_CONFIRM) when the manager opens it.
export function MarkSeenOnView({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  useEffect(() => {
    if (status !== "NEW") return;
    markSeen(bookingId).then((r) => {
      if (r.ok) router.refresh();
    });
  }, [bookingId, status, router]);
  return null;
}

export function ManagerBookingActions({
  bookingId,
  status,
  escrowState,
}: {
  bookingId: string;
  status: BookingStatus;
  escrowState: EscrowState;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPropose, setShowPropose] = useState(false);
  const [note, setNote] = useState("");

  const isActive = !["COMPLETED", "CANCELLED", "DECLINED"].includes(status);
  const canAccept = status === "NEW" || status === "PENDING_CONFIRM";
  const canComplete = escrowState === "DEPOSIT_HELD";

  function run(fn: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Greška.");
      else {
        setShowPropose(false);
        setNote("");
        router.refresh();
      }
    });
  }

  if (!isActive && !canComplete) {
    return (
      <p className="text-sm text-muted">Upit je zatvoren — nema dostupnih akcija.</p>
    );
  }

  return (
    <div className="space-y-3">
      {canAccept && (
        <button
          onClick={() => run(() => acceptRequest(bookingId))}
          disabled={pending}
          className="btn w-full bg-green py-3 text-white hover:brightness-95"
        >
          {pending ? "Obrađujem…" : "Prihvati upit"}
        </button>
      )}

      {canComplete && (
        <button
          onClick={() => run(() => confirmPerformedByManager(bookingId))}
          disabled={pending}
          className="btn w-full bg-green py-3 text-white hover:brightness-95"
        >
          Potvrdi nastup — pusti isplatu
        </button>
      )}

      {isActive && (
        <>
          {!showPropose ? (
            <button
              onClick={() => setShowPropose(true)}
              disabled={pending}
              className="btn-secondary w-full"
            >
              Predloži izmenu
            </button>
          ) : (
            <div className="rounded-[12px] border border-line-2 p-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="input"
                placeholder="npr. Predlažemo drugi termin ili viši honorar zbog udaljenosti…"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => run(() => proposeChange(bookingId, note))}
                  disabled={pending || !note.trim()}
                  className="btn-primary flex-1"
                >
                  Pošalji predlog
                </button>
                <button
                  onClick={() => setShowPropose(false)}
                  className="btn-ghost"
                  disabled={pending}
                >
                  Otkaži
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => run(() => declineRequest(bookingId))}
            disabled={pending}
            className="btn-danger w-full"
          >
            Odbij upit
          </button>
        </>
      )}

      {error && <p className="text-sm text-coral">{error}</p>}
    </div>
  );
}
