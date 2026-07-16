"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { getPaymentProvider } from "@/lib/payments";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// Loads a booking the current manager/artist controls (RLS gates visibility).
async function loadControlled(bookingId: string) {
  const user = await getSessionUser();
  const { t } = await getT();
  if (!user || user.role === "ORGANIZER") {
    return { error: t.errors.notAllowed as string, supabase: null, booking: null };
  }
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { error: t.errors.notFound, supabase: null, booking: null };
  return { error: null, supabase, booking };
}

function revalidate(bookingId: string) {
  revalidatePath("/panel");
  revalidatePath(`/panel/upit/${bookingId}`);
  // Organizer side sees the same booking (spec §6: promena se odražava na obe strane).
  revalidatePath("/moji-upiti");
  revalidatePath(`/moji-upiti/${bookingId}`);
}

// Opening a NEW request marks it as seen -> PENDING_CONFIRM (spec §6).
export async function markSeen(bookingId: string): Promise<ActionResult> {
  const { error, supabase, booking } = await loadControlled(bookingId);
  if (error || !supabase) return { ok: false, error: error ?? "" };
  if (booking.status !== "NEW") return { ok: true };

  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ status: "PENDING_CONFIRM" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };
  revalidate(bookingId);
  return { ok: true };
}

// Accept on behalf of the artist -> CONFIRMED. Organizer can then pay the deposit.
export async function acceptRequest(bookingId: string): Promise<ActionResult> {
  const { error, supabase, booking } = await loadControlled(bookingId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };
  if (!["NEW", "PENDING_CONFIRM"].includes(booking.status)) {
    return { ok: false, error: t.managerActions.errCannotAccept };
  }
  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ status: "CONFIRMED" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };
  revalidate(bookingId);
  return { ok: true };
}

// Decline -> DECLINED (+ refund if a deposit was somehow already held).
export async function declineRequest(bookingId: string): Promise<ActionResult> {
  const { error, supabase, booking } = await loadControlled(bookingId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };
  if (["COMPLETED", "CANCELLED", "DECLINED"].includes(booking.status)) {
    return { ok: false, error: t.managerActions.errCannotDecline };
  }
  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ status: "DECLINED" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };

  if (booking.escrow_state === "DEPOSIT_HELD") {
    await getPaymentProvider(supabase).refund(bookingId);
  }
  revalidate(bookingId);
  return { ok: true };
}

// Propose a change: append a note for the organizer, keep it pending.
export async function proposeChange(
  bookingId: string,
  note: string,
): Promise<ActionResult> {
  const { t } = await getT();
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: t.managerActions.errProposeEmpty };

  const { error, supabase, booking } = await loadControlled(bookingId);
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };
  if (["COMPLETED", "CANCELLED", "DECLINED"].includes(booking.status)) {
    return { ok: false, error: t.managerActions.errNotActive };
  }

  const appended =
    (booking.message ? booking.message + "\n\n" : "") +
    `[Predlog izmene od benda]: ${trimmed}`;

  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ message: appended, status: "PENDING_CONFIRM" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };
  revalidate(bookingId);
  return { ok: true };
}

// Manager may also confirm the gig happened -> COMPLETED + RELEASED.
export async function confirmPerformedByManager(bookingId: string): Promise<ActionResult> {
  const { error, supabase, booking } = await loadControlled(bookingId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };
  if (booking.escrow_state !== "DEPOSIT_HELD") {
    return { ok: false, error: t.managerActions.errNoEscrow };
  }
  const { error: updErr } = await supabase
    .from("booking_requests")
    .update({ status: "COMPLETED" })
    .eq("id", bookingId);
  if (updErr) return { ok: false, error: updErr.message };
  await getPaymentProvider(supabase).release(bookingId);
  revalidate(bookingId);
  return { ok: true };
}
