"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { computeFees } from "@/lib/pricing";
import { getPaymentProvider } from "@/lib/payments";
import type { Market } from "@/lib/types";

export interface BookingFormState {
  ok: boolean;
  error?: string;
}

// Organizer sends a booking request -> status NEW, escrow NONE (spec §6).
export async function createBookingRequest(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const user = await getSessionUser();
  const { t } = await getT();
  if (!user || user.role !== "ORGANIZER") {
    return { ok: false, error: t.bookingForm.errOnlyOrganizer };
  }

  const artistId = String(formData.get("artistId") ?? "");
  const eventType = String(formData.get("eventType") ?? "").trim();
  const market = (String(formData.get("market") ?? "DOMESTIC") as Market);
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const guests = parseInt(String(formData.get("guests") ?? "0"), 10) || 0;
  const message = String(formData.get("message") ?? "").trim();

  if (!artistId || !eventType || !city || !country || !date) {
    return { ok: false, error: t.bookingForm.errRequired };
  }

  const supabase = await createClient();

  // Price basis comes from the artist's "cena od".
  const { data: artistRow, error: artistErr } = await supabase
    .from("artists")
    .select("price_from")
    .eq("id", artistId)
    .maybeSingle();
  if (artistErr || !artistRow) {
    return { ok: false, error: t.bookingForm.errArtist };
  }

  const fees = computeFees(artistRow.price_from, market);

  const { data: inserted, error } = await supabase
    .from("booking_requests")
    .insert({
      artist_id: artistId,
      organizer_user_id: user.id,
      market,
      event_type: eventType,
      city,
      country,
      date,
      guests,
      message,
      fee_artist: fees.feeArtist,
      logistics_fee: fees.logisticsFee,
      commission: fees.commission,
      fee_total: fees.feeTotal,
      status: "NEW",
      escrow_state: "NONE",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/moji-upiti");
  redirect(`/moji-upiti/${inserted.id}?novo=1`);
}

async function loadOwnBooking(bookingId: string) {
  const user = await getSessionUser();
  const { t } = await getT();
  if (!user || user.role !== "ORGANIZER") {
    return { error: t.errors.notAllowed as string, supabase: null, booking: null, user: null };
  }
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingId)
    .eq("organizer_user_id", user.id)
    .maybeSingle();
  if (!booking) return { error: t.errors.notFound, supabase: null, booking: null, user: null };
  return { error: null, supabase, booking, user };
}

// Simulated escrow deposit: CONFIRMED + NONE -> escrow DEPOSIT_HELD.
export async function payDeposit(bookingId: string): Promise<BookingFormState> {
  const { error, supabase, booking } = await loadOwnBooking(bookingId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };

  if (booking.status !== "CONFIRMED" || booking.escrow_state !== "NONE") {
    return { ok: false, error: t.bookingDetail.errPayAfterConfirm };
  }

  const pay = getPaymentProvider(supabase);
  await pay.createDeposit(bookingId, booking.fee_total);
  await pay.holdInEscrow(bookingId);

  revalidatePath(`/moji-upiti/${bookingId}`);
  revalidatePath("/moji-upiti");
  return { ok: true };
}

// After the gig: DEPOSIT_HELD -> status COMPLETED + escrow RELEASED.
export async function confirmPerformed(bookingId: string): Promise<BookingFormState> {
  const { error, supabase, booking } = await loadOwnBooking(bookingId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };

  if (booking.escrow_state !== "DEPOSIT_HELD") {
    return { ok: false, error: t.bookingDetail.errNoEscrow };
  }

  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ status: "COMPLETED" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };

  const pay = getPaymentProvider(supabase);
  await pay.release(bookingId);

  revalidatePath(`/moji-upiti/${bookingId}`);
  revalidatePath("/moji-upiti");
  return { ok: true };
}

// Cancel before the gig: -> CANCELLED, refund if a deposit was held.
export async function cancelBooking(bookingId: string): Promise<BookingFormState> {
  const { error, supabase, booking } = await loadOwnBooking(bookingId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };

  if (["COMPLETED", "CANCELLED", "DECLINED"].includes(booking.status)) {
    return { ok: false, error: t.bookingDetail.errCannotCancel };
  }

  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ status: "CANCELLED" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };

  if (booking.escrow_state === "DEPOSIT_HELD") {
    const pay = getPaymentProvider(supabase);
    await pay.refund(bookingId);
  }

  revalidatePath(`/moji-upiti/${bookingId}`);
  revalidatePath("/moji-upiti");
  return { ok: true };
}
