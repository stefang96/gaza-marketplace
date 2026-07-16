import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getArtistsByManager, getManagerInbox } from "@/lib/db/queries";
import { getT } from "@/i18n/server";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { VerifiedChip } from "@/components/ui/StatusChip";
import { formatEur } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { BookingStatus } from "@/lib/types";

export const metadata = { title: "Roster · Panel · Gaža" };

const OPEN: BookingStatus[] = ["NEW", "PENDING_CONFIRM"];

export default async function RosterPage() {
  const user = await getSessionUser();
  if (!user) redirect("/prijava?next=/panel/izvodjaci");
  if (user.role === "ORGANIZER") redirect("/pretraga");

  const [artists, inbox, { t }] = await Promise.all([
    getArtistsByManager(user.id),
    getManagerInbox(user.id),
    getT(),
  ]);

  const openByArtist = new Map<string, number>();
  for (const b of inbox) {
    if (OPEN.includes(b.status)) {
      openByArtist.set(b.artistId, (openByArtist.get(b.artistId) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/panel" className="text-sm text-muted hover:text-ink">
            ← {t.roster.backToPanel}
          </Link>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">{t.roster.title}</h1>
          <p className="text-muted">
            {artists.length} {t.roster.subtitlePrefix}
          </p>
        </div>
        <Link href="/panel/izvodjaci/novi" className="btn-primary">
          {t.roster.addArtist}
        </Link>
      </div>

      <div className="grid gap-3">
        {artists.map((a) => {
          const open = openByArtist.get(a.id) ?? 0;
          return (
            <Link
              key={a.id}
              href={`/panel/izvodjaci/${a.id}/izmena`}
              className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-soft-lg"
            >
              <Avatar name={a.name} color={avatarColorFor(a.name)} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold text-ink">{a.name}</span>
                  {a.verified && <VerifiedChip />}
                </div>
                <div className="text-sm text-muted">{a.kind}</div>
                <div className="mt-1 flex items-center gap-3">
                  <Stars value={a.ratingAvg} count={a.ratingCount} />
                  <span className="chip chip-neutral">{t.genres[a.genre]}</span>
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-xs text-muted">{t.roster.priceFrom}</div>
                <div className="font-display font-bold text-ink">{formatEur(a.priceFrom)}</div>
              </div>
              {open > 0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue px-2 text-xs font-bold text-white">
                  {open}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
