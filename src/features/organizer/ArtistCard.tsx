"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { VerifiedChip } from "@/components/ui/StatusChip";
import { ArtistCover } from "@/components/ArtistCover";
import { formatEur, formatDate } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import { useT } from "@/i18n/provider";
import type { ArtistCard as ArtistCardModel } from "@/lib/db/queries";

export function ArtistCard({ artist }: { artist: ArtistCardModel }) {
  const t = useT();
  return (
    <Link
      href={`/izvodjac/${artist.id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-soft-lg"
    >
      {/* Cover banner: real photo if set, otherwise generated genre art */}
      <div className="h-24 w-full">
        {artist.photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={artist.photoUrl} alt={artist.name} className="h-24 w-full object-cover" />
        ) : (
          <ArtistCover name={artist.name} genre={artist.genre} className="h-24 w-full" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-0">
        <span className="-mt-8 mb-2 inline-flex w-fit rounded-full ring-4 ring-surface">
          <Avatar name={artist.name} color={avatarColorFor(artist.name)} size="lg" />
        </span>

        <h3 className="font-display text-lg font-bold text-ink">{artist.name}</h3>
        <p className="text-sm text-muted">{artist.kind}</p>
        <div className="mt-1">
          <Stars value={artist.ratingAvg} count={artist.ratingCount} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip chip-neutral">{t.genres[artist.genre]}</span>
          <span className="chip chip-neutral">📍 {artist.city}</span>
          {artist.verified && <VerifiedChip />}
          {artist.youtubeUrl && <span className="chip chip-neutral">🎬 {t.search.video}</span>}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <div className="text-xs text-muted">{t.search.priceFrom}</div>
            <div className="font-display text-xl font-bold text-ink">
              {formatEur(artist.priceFrom)}
            </div>
          </div>
          {artist.nextFreeDate ? (
            <span className="chip chip-confirmed">
              {t.search.freeOn} {formatDate(artist.nextFreeDate)}
            </span>
          ) : (
            <span className="chip chip-neutral">{t.search.checkDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
