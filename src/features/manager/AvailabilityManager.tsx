"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAvailability, removeAvailability } from "./artistActions";
import { formatDate } from "@/lib/constants";
import { useT } from "@/i18n/provider";
import type { AvailabilitySlot } from "@/lib/types";

export function AvailabilityManager({
  artistId,
  slots,
}: {
  artistId: string;
  slots: AvailabilitySlot[];
}) {
  const t = useT();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add() {
    setError(null);
    startTransition(async () => {
      const res = await addAvailability(artistId, date);
      if (!res.ok) setError(res.error ?? t.errors.generic);
      else {
        setDate("");
        router.refresh();
      }
    });
  }

  function remove(slotId: string) {
    startTransition(async () => {
      await removeAvailability(slotId, artistId);
      router.refresh();
    });
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-bold text-ink">{t.manage.calendarTitle}</h2>
      <p className="mt-1 text-xs text-muted">{t.manage.calendarHint}</p>

      <div className="mt-4 flex gap-2">
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={add} disabled={pending || !date} className="btn-primary shrink-0">
          {t.manage.addDate}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-coral">{error}</p>}

      {slots.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t.manage.noSlots}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {slots.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-[12px] bg-surface-2 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className="font-medium text-ink">{formatDate(s.date)}</span>
                {s.status === "BOOKED" && (
                  <span className="chip chip-neutral">{t.manage.booked}</span>
                )}
                {s.status === "FREE" && <span className="chip chip-confirmed">FREE</span>}
              </span>
              {s.status !== "BOOKED" && (
                <button
                  onClick={() => remove(s.id)}
                  disabled={pending}
                  className="text-sm font-medium text-coral hover:underline"
                >
                  {t.manage.remove}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
