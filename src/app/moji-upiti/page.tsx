import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrganizerBookings } from "@/lib/db/queries";
import { getT } from "@/i18n/server";
import { Avatar } from "@/components/ui/Avatar";
import { StatusChip, MarketChip } from "@/components/ui/StatusChip";
import { formatEur, formatDate } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";

export const metadata = { title: "Moji upiti · Gaža" };

export default async function MyBookingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/prijava?next=/moji-upiti");
  if (user.role !== "ORGANIZER") redirect("/panel");

  const [bookings, { t }] = await Promise.all([
    getOrganizerBookings(user.id),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">{t.myBookings.title}</h1>
          <p className="mt-1 text-muted">{t.myBookings.subtitle}</p>
        </div>
        <Link href="/pretraga" className="btn-primary">
          {t.myBookings.newRequest}
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <div className="mb-3 text-4xl">📩</div>
          <h3 className="font-display text-lg font-bold text-ink">{t.myBookings.emptyTitle}</h3>
          <p className="mt-1 text-sm text-muted">{t.myBookings.emptyBody}</p>
          <Link href="/pretraga" className="btn-primary mt-4">
            {t.myBookings.searchBands}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/moji-upiti/${b.id}`}
              className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-soft-lg"
            >
              <Avatar name={b.artist.name} color={avatarColorFor(b.artist.name)} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-ink">{b.artist.name}</span>
                  <MarketChip market={b.market} />
                </div>
                <div className="text-sm text-muted">
                  {b.eventType} · {b.city} · {formatDate(b.date)}
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="font-display font-bold text-ink">{formatEur(b.feeTotal)}</div>
              </div>
              <StatusChip status={b.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
