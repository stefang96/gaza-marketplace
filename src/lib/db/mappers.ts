import type {
  Artist,
  AvailabilitySlot,
  BookingRequest,
  BookingWithArtist,
  Review,
} from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapArtist(row: any): Artist {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    managerId: row.manager_id,
    name: row.name,
    kind: row.kind,
    genre: row.genre,
    city: row.city,
    bio: row.bio,
    tags: row.tags ?? [],
    priceFrom: row.price_from,
    ratingAvg: Number(row.rating_avg),
    ratingCount: row.rating_count,
    verified: row.verified,
    youtubeUrl: row.youtube_url ?? null,
  };
}

export function mapAvailability(row: any): AvailabilitySlot {
  return {
    id: row.id,
    artistId: row.artist_id,
    date: row.date,
    status: row.status,
  };
}

export function mapReview(row: any): Review {
  return {
    id: row.id,
    artistId: row.artist_id,
    organizerName: row.organizer_name,
    eventLabel: row.event_label,
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at,
  };
}

export function mapBooking(row: any): BookingRequest {
  return {
    id: row.id,
    artistId: row.artist_id,
    organizerUserId: row.organizer_user_id,
    market: row.market,
    eventType: row.event_type,
    city: row.city,
    country: row.country,
    date: row.date,
    guests: row.guests,
    message: row.message,
    feeArtist: row.fee_artist,
    logisticsFee: row.logistics_fee,
    commission: row.commission,
    feeTotal: row.fee_total,
    status: row.status,
    escrowState: row.escrow_state,
    logisticsTransport: row.logistics_transport,
    logisticsStay: row.logistics_stay,
    logisticsPapers: row.logistics_papers,
    createdAt: row.created_at,
  };
}

export function mapBookingWithArtist(row: any): BookingWithArtist {
  const base = mapBooking(row);
  const a = row.artists ?? {};
  return {
    ...base,
    artist: {
      id: a.id ?? base.artistId,
      name: a.name ?? "Izvođač",
      kind: a.kind ?? "",
      genre: a.genre ?? "COVER",
      verified: a.verified ?? false,
    },
  };
}
