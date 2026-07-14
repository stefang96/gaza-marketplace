import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getArtistsByManager, getManagerInbox } from "@/lib/db/queries";
import { Avatar } from "@/components/ui/Avatar";
import { StatusChip, MarketChip } from "@/components/ui/StatusChip";
import { formatEur, formatDate, GENRE_LABELS } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import { InboxFilters } from "@/features/manager/InboxFilters";
import type { BookingStatus, Market } from "@/lib/types";

export const metadata = { title: "Panel · Gaža" };

const OPEN_STATUSES: BookingStatus[] = ["NEW", "PENDING_CONFIRM"];

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/prijava?next=/panel");
  if (user.role === "ORGANIZER") redirect("/pretraga");

  const [artists, inbox] = await Promise.all([
    getArtistsByManager(user.id),
    getManagerInbox(user.id),
  ]);

  // KPIs (from full inbox, independent of filters).
  const openCount = inbox.filter((b) => OPEN_STATUSES.includes(b.status)).length;
  const confirmedCount = inbox.filter((b) => b.status === "CONFIRMED").length;
  const escrowCount = inbox.filter((b) => b.escrowState === "DEPOSIT_HELD").length;
  const completedRevenue = inbox
    .filter((b) => b.status === "COMPLETED")
    .reduce((s, b) => s + b.feeArtist, 0);

  // Filters for the list.
  const fMarket = sp.trziste as Market | undefined;
  const fStatus = sp.status as BookingStatus | undefined;
  const filtered = inbox.filter(
    (b) => (!fMarket || b.market === fMarket) && (!fStatus || b.status === fStatus),
  );

  // Open-request count per artist for roster badges.
  const openByArtist = new Map<string, number>();
  for (const b of inbox) {
    if (OPEN_STATUSES.includes(b.status)) {
      openByArtist.set(b.artistId, (openByArtist.get(b.artistId) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Menadžerski panel</h1>
          <p className="mt-1 text-muted">
            {user.name} · {artists.length} izvođača u rosteru
          </p>
        </div>
        <Link href="/panel/izvodjaci" className="btn-secondary">
          Upravljaj rosterom
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Otvoreni upiti" value={openCount} tone="blue" />
        <Kpi label="Potvrđeni" value={confirmedCount} tone="green" />
        <Kpi label="U escrow-u" value={escrowCount} tone="amber" />
        <Kpi label="Zarada (završeno)" value={formatEur(completedRevenue)} tone="ink" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Roster */}
        <aside className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
            Roster
          </h2>
          {artists.map((a) => {
            const open = openByArtist.get(a.id) ?? 0;
            return (
              <Link
                key={a.id}
                href={`/izvodjac/${a.id}`}
                className="card flex items-center gap-3 p-3 transition-shadow hover:shadow-soft-lg"
              >
                <Avatar name={a.name} color={avatarColorFor(a.name)} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{a.name}</div>
                  <div className="text-xs text-muted">{GENRE_LABELS[a.genre]}</div>
                </div>
                {open > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue px-1.5 text-xs font-bold text-white">
                    {open}
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        {/* Unified inbox */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink">
              Inbox — svi upiti
            </h2>
            <InboxFilters />
          </div>

          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="mb-2 text-3xl">📭</div>
              <p className="text-sm text-muted">Nema upita za izabrane filtere.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((b) => (
                <Link
                  key={b.id}
                  href={`/panel/upit/${b.id}`}
                  className="card block p-4 transition-shadow hover:shadow-soft-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={b.artist.name}
                      color={avatarColorFor(b.artist.name)}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{b.artist.name}</span>
                        <MarketChip market={b.market} />
                        {b.status === "NEW" && (
                          <span className="h-2 w-2 rounded-full bg-blue" title="Novo" />
                        )}
                      </div>
                      <div className="text-sm text-muted">
                        {b.eventType} · {b.city}, {b.country} · {formatDate(b.date)}
                      </div>
                      <div className="text-xs text-muted">
                        Naručilac: {b.organizer?.name ?? "—"} · {b.guests} gostiju
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="font-display font-bold text-ink">
                        {formatEur(b.feeTotal)}
                      </div>
                    </div>
                    <StatusChip status={b.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "green" | "amber" | "ink";
}) {
  const dot = {
    blue: "bg-blue",
    green: "bg-green",
    amber: "bg-amber",
    ink: "bg-ink",
  }[tone];
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-xs text-muted">{label}</span>
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
