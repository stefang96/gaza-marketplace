"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "./reviewActions";
import { Stars } from "@/components/ui/Stars";
import { useT } from "@/i18n/provider";

export function ReviewSection({
  bookingId,
  existingRating,
  existingText,
}: {
  bookingId: string;
  existingRating: number | null;
  existingText: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Already reviewed -> show the submitted review, read-only.
  if (existingRating) {
    return (
      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t.reviews.title}</h2>
        <div className="mt-3 rounded-[12px] bg-green-soft p-3">
          <div className="flex items-center gap-2">
            <Stars value={existingRating} showValue={false} />
            <span className="text-sm font-semibold text-green">{t.reviews.thanks}</span>
          </div>
          {existingText && <p className="mt-2 text-sm text-ink-soft">{existingText}</p>}
        </div>
      </div>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitReview(bookingId, rating, text);
      if (!res.ok) setError(res.error ?? t.errors.generic);
      else router.refresh();
    });
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-bold text-ink">{t.reviews.title}</h2>

      <div className="mt-3">
        <div className="label">{t.reviews.ratingLabel}</div>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="text-2xl leading-none transition-transform hover:scale-110"
              style={{ color: (hover || rating) >= n ? "var(--amber)" : "var(--line-2)" }}
              aria-label={`${n}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="reviewText">
          {t.reviews.commentLabel}
        </label>
        <textarea
          id="reviewText"
          rows={3}
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.reviews.commentPlaceholder}
        />
      </div>

      {error && <p className="mt-2 text-sm text-coral">{error}</p>}

      <button
        onClick={submit}
        disabled={pending || rating === 0}
        className="btn-primary mt-4 w-full"
      >
        {pending ? t.reviews.submitting : t.reviews.submit}
      </button>
    </div>
  );
}
