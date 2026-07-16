import { createClient } from "@/lib/supabase/server";
import {
  mapArtist,
  mapAvailability,
  mapBooking,
  mapBookingWithArtist,
  mapReview,
} from "./mappers";
import type {
  Artist,
  BookingOrganizer,
  BookingStatus,
  Genre,
  Market,
} from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const BOOKING_WITH_ARTIST = `
  *,
  artists ( id, name, kind, genre, verified )
`;

export interface ArtistFilters {
  genre?: Genre;
  city?: string;
  maxPrice?: number;
  q?: string;
  availableFrom?: string; // ISO date — only artists free on/after this date
}

export interface ArtistCard extends Artist {
  nextFreeDate: string | null;
}

// Catalog for the organizer search page. Works logged-out (public read).
export async function getArtists(filters: ArtistFilters = {}): Promise<ArtistCard[]> {
  const supabase = await createClient();

  let query = supabase.from("artists").select("*").order("rating_avg", { ascending: false });

  if (filters.genre) query = query.eq("genre", filters.genre);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.maxPrice) query = query.lte("price_from", filters.maxPrice);
  if (filters.q) query = query.ilike("name", `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw error;

  const artists = (data ?? []).map(mapArtist);

  // Attach the next free availability date (for the "slobodan termin" badge).
  // When a date filter is set, only count slots on/after it.
  const ids = artists.map((a) => a.id);
  const freeByArtist = new Map<string, string>();
  const floor = filters.availableFrom || new Date().toISOString().slice(0, 10);
  if (ids.length) {
    const { data: slots } = await supabase
      .from("availability")
      .select("artist_id, date, status")
      .in("artist_id", ids)
      .eq("status", "FREE")
      .gte("date", floor)
      .order("date", { ascending: true });
    for (const s of slots ?? []) {
      if (!freeByArtist.has(s.artist_id)) freeByArtist.set(s.artist_id, s.date);
    }
  }

  const withFree = artists.map((a) => ({ ...a, nextFreeDate: freeByArtist.get(a.id) ?? null }));
  // If filtering by date, keep only artists that actually have a free slot then.
  return filters.availableFrom ? withFree.filter((a) => a.nextFreeDate) : withFree;
}

export async function getArtistById(id: string) {
  const supabase = await createClient();

  const { data: artistRow, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!artistRow) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: slots }, { data: reviews }] = await Promise.all([
    supabase
      .from("availability")
      .select("*")
      .eq("artist_id", id)
      .gte("date", today)
      .order("date", { ascending: true }),
    supabase
      .from("reviews")
      .select("*")
      .eq("artist_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    artist: mapArtist(artistRow),
    availability: (slots ?? []).map(mapAvailability),
    reviews: (reviews ?? []).map(mapReview),
  };
}

export async function getOrganizerBookings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select(BOOKING_WITH_ARTIST)
    .eq("organizer_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBookingWithArtist);
}

export async function getBookingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select(BOOKING_WITH_ARTIST)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBookingWithArtist(data) : null;
}

// ---------------- Manager side (M5/M6) ----------------

export async function getArtistsByManager(managerId: string): Promise<Artist[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("manager_id", managerId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapArtist);
}

// Attaches organizer profiles to a set of bookings in a single extra query.
async function attachOrganizers(
  supabase: SupabaseClient,
  bookings: ReturnType<typeof mapBookingWithArtist>[],
) {
  const ids = [...new Set(bookings.map((b) => b.organizerUserId))];
  if (!ids.length) return bookings;
  const { data } = await supabase
    .from("profiles")
    .select("id, name, phone, email, avatar_color, created_at")
    .in("id", ids);
  const byId = new Map<string, BookingOrganizer>();
  for (const p of data ?? []) {
    byId.set(p.id, {
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      avatarColor: p.avatar_color,
      createdAt: p.created_at,
    });
  }
  return bookings.map((b) => ({ ...b, organizer: byId.get(b.organizerUserId) }));
}

export interface InboxFilters {
  market?: Market;
  status?: BookingStatus;
}

// Unified inbox: every request for every artist the manager controls.
export async function getManagerInbox(managerId: string, filters: InboxFilters = {}) {
  const supabase = await createClient();

  const artists = await getArtistsByManager(managerId);
  const artistIds = artists.map((a) => a.id);
  if (!artistIds.length) return [];

  let query = supabase
    .from("booking_requests")
    .select(BOOKING_WITH_ARTIST)
    .in("artist_id", artistIds)
    .order("created_at", { ascending: false });

  if (filters.market) query = query.eq("market", filters.market);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;

  const mapped = (data ?? []).map(mapBookingWithArtist);
  return attachOrganizers(supabase, mapped);
}

// Single request for the manager detail view (with organizer profile).
export async function getManagerBookingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select(BOOKING_WITH_ARTIST)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [withOrg] = await attachOrganizers(supabase, [mapBookingWithArtist(data)]);
  return withOrg;
}

export async function getReviewForBooking(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();
  return data ? mapReview(data) : null;
}

export { mapBooking };
