import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistById } from "@/lib/db/queries";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { VerifiedChip } from "@/components/ui/StatusChip";
import { formatEur, formatDate } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { Review } from "@/lib/types";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getArtistById(id);
  if (!data) notFound();

  const { artist, availability, reviews } = data;
  const [user, { t }] = await Promise.all([getSessionUser(), getT()]);
  const isOrganizer = user?.role === "ORGANIZER";
  const freeSlots = availability.filter((s) => s.status === "FREE");

  // Illustrative price list by event type (basis = "cena od").
  const priceList = [
    { label: t.artist.plClub, price: artist.priceFrom },
    { label: t.artist.plSlava, price: Math.round(artist.priceFrom * 1.1) },
    { label: t.artist.plWedding, price: Math.round(artist.priceFrom * 1.3) },
    { label: t.artist.plCorporate, price: Math.round(artist.priceFrom * 1.4) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/pretraga" className="text-sm text-muted hover:text-ink">
        ← {t.artist.backToSearch}
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: profile */}
        <div className="space-y-6">
          <div className="card overflow-hidden">
            {artist.photoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={artist.photoUrl}
                alt={artist.name}
                className="h-52 w-full object-cover"
              />
            )}
            <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar name={artist.name} color={avatarColorFor(artist.name)} size="lg" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-ink">{artist.name}</h1>
                  {artist.verified && <VerifiedChip />}
                </div>
                <p className="text-muted">{artist.kind}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Stars value={artist.ratingAvg} count={artist.ratingCount} />
                  <span className="chip chip-neutral">{t.genres[artist.genre]}</span>
                  <span className="chip chip-neutral">📍 {artist.city}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-ink-soft">{artist.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {artist.tags.map((tag) => (
                <span key={tag} className="chip chip-neutral">
                  #{tag}
                </span>
              ))}
            </div>

            {artist.youtubeUrl && (
              <a
                href={artist.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 inline-flex"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21.6 7.2a2.7 2.7 0 00-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 002.4 7.2 28 28 0 002 12a28 28 0 00.4 4.8 2.7 2.7 0 001.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 001.9-1.9A28 28 0 0022 12a28 28 0 00-.4-4.8z" fill="#E4553B" />
                  <path d="M10 15l5-3-5-3v6z" fill="#fff" />
                </svg>
                {t.artist.watchPerformance}
              </a>
            )}
            </div>
          </div>

          {/* Pricelist */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">{t.artist.priceList}</h2>
            <ul className="mt-3 divide-y divide-line">
              {priceList.map((p) => (
                <li key={p.label} className="flex items-center justify-between py-2.5">
                  <span className="text-ink-soft">{p.label}</span>
                  <span className="font-semibold text-ink">
                    {t.artist.from} {formatEur(p.price)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">{t.artist.priceListNote}</p>
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              {t.artist.reviews} ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted">{t.artist.noReviews}</p>
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
            <div className="text-sm text-muted">{t.artist.priceFrom}</div>
            <div className="font-display text-3xl font-bold text-ink">
              {formatEur(artist.priceFrom)}
            </div>

            <div className="mt-4 rounded-[12px] bg-green-soft p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green">
                <span>🛡️</span> {t.artist.protectionTitle}
              </div>
              <p className="mt-1 text-xs text-ink-soft">{t.artist.protectionBody}</p>
            </div>

            {isOrganizer ? (
              <Link
                href={`/izvodjac/${artist.id}/upit`}
                className="btn-primary mt-4 w-full py-3 text-base"
              >
                {t.artist.sendRequest}
              </Link>
            ) : user ? (
              <p className="mt-4 rounded-[12px] bg-surface-2 p-3 text-center text-xs text-muted">
                {t.artist.publicProfileNote}
              </p>
            ) : (
              <Link href="/prijava" className="btn-primary mt-4 w-full py-3 text-base">
                {t.artist.loginToSend}
              </Link>
            )}

            {freeSlots.length > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 text-xs font-medium text-ink-soft">
                  {t.artist.freeSlots}
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
