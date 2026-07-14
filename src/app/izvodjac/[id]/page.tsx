import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistById } from "@/lib/db/queries";
import { getSessionUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { VerifiedChip } from "@/components/ui/StatusChip";
import { GENRE_LABELS, formatEur, formatDate } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { Review } from "@/lib/types";

// Illustrative price list by event type (basis = "cena od").
function priceList(base: number) {
  return [
    { label: "Klupsko veče", price: base },
    { label: "Slava / proslava", price: Math.round(base * 1.1) },
    { label: "Svadba", price: Math.round(base * 1.3) },
    { label: "Korporativno", price: Math.round(base * 1.4) },
  ];
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getArtistById(id);
  if (!data) notFound();

  const { artist, availability, reviews } = data;
  const user = await getSessionUser();
  const isOrganizer = user?.role === "ORGANIZER";
  const freeSlots = availability.filter((s) => s.status === "FREE");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/pretraga" className="text-sm text-muted hover:text-ink">
        ← Nazad na pretragu
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: profile */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <Avatar name={artist.name} color={avatarColorFor(artist.name)} size="lg" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-ink">
                    {artist.name}
                  </h1>
                  {artist.verified && <VerifiedChip />}
                </div>
                <p className="text-muted">{artist.kind}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Stars value={artist.ratingAvg} count={artist.ratingCount} />
                  <span className="chip chip-neutral">{GENRE_LABELS[artist.genre]}</span>
                  <span className="chip chip-neutral">📍 {artist.city}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-ink-soft">{artist.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {artist.tags.map((t) => (
                <span key={t} className="chip chip-neutral">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Pricelist */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Cenovnik</h2>
            <ul className="mt-3 divide-y divide-line">
              {priceList(artist.priceFrom).map((p) => (
                <li key={p.label} className="flex items-center justify-between py-2.5">
                  <span className="text-ink-soft">{p.label}</span>
                  <span className="font-semibold text-ink">od {formatEur(p.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              Za nastupe u dijaspori se dodaje logistika (prevoz, smeštaj, papiri).
            </p>
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Utisci ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Još nema utisaka.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {reviews.map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: sticky booking CTA */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <div className="text-sm text-muted">Cena od</div>
            <div className="font-display text-3xl font-bold text-ink">
              {formatEur(artist.priceFrom)}
            </div>

            <div className="mt-4 rounded-[12px] bg-green-soft p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green">
                <span>🛡️</span> Zaštita plaćanja
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Uplata stoji u escrow-u i pušta se izvođaču tek pošto odsvira.
              </p>
            </div>

            {isOrganizer ? (
              <Link
                href={`/izvodjac/${artist.id}/upit`}
                className="btn-primary mt-4 w-full py-3 text-base"
              >
                Pošalji upit za rezervaciju
              </Link>
            ) : (
              <Link href="/prijava" className="btn-primary mt-4 w-full py-3 text-base">
                Prijavi se za slanje upita
              </Link>
            )}

            {freeSlots.length > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 text-xs font-medium text-ink-soft">
                  Slobodni termini
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {freeSlots.slice(0, 5).map((s) => (
                    <span key={s.id} className="chip chip-confirmed">
                      {formatDate(s.date)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="border-b border-line pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{review.organizerName}</span>
        <Stars value={review.rating} showValue={false} />
      </div>
      <div className="text-xs text-muted">{review.eventLabel}</div>
      <p className="mt-1 text-sm text-ink-soft">{review.text}</p>
    </li>
  );
}
