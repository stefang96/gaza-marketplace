// Domain model — mirrors the Postgres schema (spec §4).

export type UserRole = "ARTIST" | "MANAGER" | "ORGANIZER";

export type Genre =
  | "NAROD"
  | "TRUBACI"
  | "COVER"
  | "DJ"
  | "POPFOLK"
  | "TAMBURASI";

export type Market = "DOMESTIC" | "DIASPORA";

export type Availability = "FREE" | "HELD" | "BOOKED";

export type BookingStatus =
  | "NEW"
  | "PENDING_CONFIRM"
  | "CONFIRMED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED";

export type EscrowState = "NONE" | "DEPOSIT_HELD" | "RELEASED" | "REFUNDED";

export interface AppUser {
  id: string;
  role: UserRole;
  name: string;
  email: string | null;
  phone: string | null;
  googleId: string | null;
  avatarColor: string;
  createdAt: string;
}

export interface Artist {
  id: string;
  ownerUserId: string | null;
  managerId: string | null;
  name: string;
  kind: string; // npr. "Narodna pevačica", "Trubači · 8 članova"
  genre: Genre;
  city: string;
  bio: string;
  tags: string[];
  priceFrom: number;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
}

export interface AvailabilitySlot {
  id: string;
  artistId: string;
  date: string; // ISO date
  status: Availability;
}

export interface BookingRequest {
  id: string;
  artistId: string;
  organizerUserId: string;
  market: Market;
  eventType: string;
  city: string;
  country: string;
  date: string; // ISO date
  guests: number;
  message: string;
  feeArtist: number;
  logisticsFee: number;
  commission: number; // 15%
  feeTotal: number;
  status: BookingStatus;
  escrowState: EscrowState;
  logisticsTransport: string | null;
  logisticsStay: string | null;
  logisticsPapers: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  artistId: string;
  organizerName: string;
  eventLabel: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}

// --- View models (joined) ---
export interface BookingWithArtist extends BookingRequest {
  artist: Pick<Artist, "id" | "name" | "kind" | "genre" | "verified"> & {
    avatarColor?: string;
  };
}
