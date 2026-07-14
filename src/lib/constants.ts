import type {
  BookingStatus,
  EscrowState,
  Genre,
  Market,
  UserRole,
} from "./types";

export const COMMISSION_RATE = 0.15; // provizija 15% (spec §6)

export const GENRE_LABELS: Record<Genre, string> = {
  NAROD: "Narodna",
  TRUBACI: "Trubači",
  COVER: "Cover bend",
  DJ: "DJ",
  POPFOLK: "Pop-folk",
  TAMBURASI: "Tamburaši",
};

export const GENRE_OPTIONS: { value: Genre; label: string }[] = (
  Object.keys(GENRE_LABELS) as Genre[]
).map((g) => ({ value: g, label: GENRE_LABELS[g] }));

export const MARKET_LABELS: Record<Market, string> = {
  DOMESTIC: "Balkan",
  DIASPORA: "Dijaspora",
};

// Države za select u formi upita.
export const BALKAN_COUNTRIES = [
  "Srbija",
  "Bosna i Hercegovina",
  "Crna Gora",
  "Severna Makedonija",
  "Hrvatska",
  "Slovenija",
];

export const DIASPORA_COUNTRIES = [
  "Austrija",
  "Nemačka",
  "Švajcarska",
  "Švedska",
  "Francuska",
  "Holandija",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ARTIST: "Izvođač",
  MANAGER: "Menadžer",
  ORGANIZER: "Naručilac",
};

export const EVENT_TYPES = [
  "Svadba",
  "Slava",
  "Rođendan",
  "Klupsko veče",
  "Korporativno",
  "Proslava",
] as const;

export const STATUS_LABELS: Record<BookingStatus, string> = {
  NEW: "Novo",
  PENDING_CONFIRM: "Čeka potvrdu",
  CONFIRMED: "Potvrđeno",
  DECLINED: "Odbijeno",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
};

// Maps status -> chip css class (spec §8 color semantics)
export const STATUS_CHIP: Record<BookingStatus, string> = {
  NEW: "chip-new",
  PENDING_CONFIRM: "chip-pending",
  CONFIRMED: "chip-confirmed",
  DECLINED: "chip-neutral",
  COMPLETED: "chip-confirmed",
  CANCELLED: "chip-neutral",
};

export const ESCROW_LABELS: Record<EscrowState, string> = {
  NONE: "Bez uplate",
  DEPOSIT_HELD: "Kapara na čekanju",
  RELEASED: "Isplaćeno izvođaču",
  REFUNDED: "Refundirano",
};

// Cities used for filters / seed (Balkan + dijaspora)
export const DOMESTIC_CITIES = [
  "Beograd",
  "Novi Sad",
  "Niš",
  "Kragujevac",
  "Banja Luka",
  "Skoplje",
  "Podgorica",
];

export const DIASPORA_CITIES = [
  "Beč",
  "Frankfurt",
  "Cirih",
  "Malme",
  "Minhen",
  "Štutgart",
];

export const CURRENCY = "EUR";

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}.`;
}
