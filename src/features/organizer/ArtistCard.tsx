"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { VerifiedChip } from "@/components/ui/StatusChip";
import { formatEur, formatDate } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import { useT } from "@/i18n/provider";
import type { ArtistCard as ArtistCardModel } from "@/lib/db/queries";

export function ArtistCard({ artist }: { artist: ArtistCardModel }) {
  const t = useT();
  return (
    <Link
      href={`/izvodjac/${artist.id}`}
      className="card group flex flex-col p-5 transition-shadow hover:shadow-soft-lg"
    >
      <div className="flex items-start gap-3">
        <Avatar name={artist.name} color={avatarColorFor(artist.name)} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-lg font-bold text-ink">
              {artist.name}
            </h3>
          </div>
          <p className="text-sm text-muted">{artist.kind}</p>
          <div className="mt-1 flex items-center gap-2">
            <Stars value={artist.ratingAvg} count={artist.ratingCount} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="chip chip-neutral">{t.genres[artist.genre]}</span>
        <span className="chip chip-neutral">📍 {artist.city}</span>
        {artist.verified && <VerifiedChip />}
        {artist.youtubeUrl && <span className="chip chip-neutral">🎬 {t.search.video}</span>}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
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
    </Link>
  );
}
