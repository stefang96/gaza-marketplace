"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";

export interface ReviewState {
  ok: boolean;
  error?: string;
}

// Organizer leaves a review after a COMPLETED gig. A DB trigger recomputes the
// artist's aggregate rating (spec: closes the trust loop).
export async function submitReview(
  bookingId: string,
  rating: number,
  text: string,
): Promise<ReviewState> {
  const user = await getSessionUser();
  const { t } = await getT();
  if (!user || user.role !== "ORGANIZER") return { ok: false, error: t.errors.notAllowed };
  if (!rating || rating < 1 || rating > 5) return { ok: false, error: t.reviews.errRating };

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("booking_requests")
    .select("id, artist_id, organizer_user_id, status, event_type, city")
    .eq("id", bookingId)
    .eq("organizer_user_id", user.id)
    .maybeSingle();

  if (!booking) return { ok: false, error: t.errors.notFound };
  if (booking.status !== "COMPLETED") return { ok: false, error: t.reviews.onlyCompleted };

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (existing) return { ok: false, error: t.reviews.already };

  const { error } = await supabase.from("reviews").insert({
    artist_id: booking.artist_id,
    organizer_name: user.name,
    event_label: `${booking.event_type} · ${booking.city}`,
    rating,
    text: text.trim(),
    booking_id: bookingId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/moji-upiti/${bookingId}`);
  revalidatePath(`/izvodjac/${booking.artist_id}`);
  return { ok: true };
}
