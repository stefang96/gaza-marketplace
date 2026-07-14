import { createClient } from "@/lib/supabase/server";
import {
  mapArtist,
  mapAvailability,
  mapBooking,
  mapBookingWithArtist,
  mapReview,
} from "./mappers";
import type { Artist, Genre } from "@/lib/types";

const BOOKING_WITH_ARTIST = `
  *,
  artists ( id, name, kind, genre, verified )
`;

export interface ArtistFilters {
  genre?: Genre;
  city?: string;
  maxPrice?: number;
  q?: string;
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
  const ids = artists.map((a) => a.id);
  const freeByArtist = new Map<string, string>();
  if (ids.length) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: slots } = await supabase
      .from("availability")
      .select("artist_id, date, status")
      .in("artist_id", ids)
      .eq("status", "FREE")
      .gte("date", today)
      .order("date", { ascending: true });
    for (const s of slots ?? []) {
      if (!freeByArtist.has(s.artist_id)) freeByArtist.set(s.artist_id, s.date);
    }
  }

  return artists.map((a) => ({ ...a, nextFreeDate: freeByArtist.get(a.id) ?? null }));
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

export { mapBooking };
