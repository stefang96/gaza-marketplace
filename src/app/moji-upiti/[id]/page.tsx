import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getBookingById } from "@/lib/db/queries";
import { Avatar } from "@/components/ui/Avatar";
import { StatusChip, MarketChip } from "@/components/ui/StatusChip";
import { EscrowStepper } from "@/components/EscrowStepper";
import { BookingActions } from "@/features/organizer/BookingActions";
import { formatEur, formatDate, ESCROW_LABELS } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { BookingWithArtist } from "@/lib/types";

export const metadata = { title: "Detalj upita · Gaža" };

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const isNew = sp.novo === "1";

  const user = await getSessionUser();
  if (!user) redirect(`/prijava?next=/moji-upiti/${id}`);

  const booking = await getBookingById(id);
  if (!booking || booking.organizerUserId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/moji-upiti" className="text-sm text-muted hover:text-ink">
        ← Nazad na upite
      </Link>

      {isNew && (
        <div className="mt-4 rounded-card border border-blue/30 bg-[rgba(59,98,214,0.06)] p-4">
          <div className="font-semibold text-blue">Upit poslat! 🎉</div>
          <p className="mt-1 text-sm text-ink-soft">
            Bend će pregledati i potvrditi termin. Uplata ide tek posle potvrde.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: details */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={booking.artist.name}
                  color={avatarColorFor(booking.artist.name)}
                  size="lg"
                />
                <div>
                  <h1 className="font-display text-xl font-bold text-ink">
                    {booking.artist.name}
                  </h1>
                  <p className="text-sm text-muted">{booking.artist.kind}</p>
                </div>
              </div>
              <StatusChip status={booking.status} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Field label="Tip događaja" value={booking.eventType} />
              <Field
                label="Tržište"
                value={<MarketChip market={booking.market} />}
              />
              <Field label="Datum" value={formatDate(booking.date)} />
              <Field label="Gosti" value={`${booking.guests}`} />
              <Field label="Grad" value={`${booking.city}, ${booking.country}`} />
              <Field label="Poslato" value={formatDate(booking.createdAt)} />
            </dl>

            {booking.message && (
              <div className="mt-4 rounded-[12px] bg-surface-2 p-3">
                <div className="text-xs font-medium text-muted">Poruka bendu</div>
                <p className="mt-1 text-sm text-ink-soft">{booking.message}</p>
              </div>
            )}
          </div>

          {/* Fee breakdown */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Honorar</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Izvođaču" value={formatEur(booking.feeArtist)} />
              {booking.logisticsFee > 0 && (
                <Row label="Logistika" value={formatEur(booking.logisticsFee)} />
              )}
              <Row label="Provizija (15%)" value={formatEur(booking.commission)} />
              <div className="my-1 h-px bg-line" />
              <Row label="Ukupno" value={formatEur(booking.feeTotal)} strong />
            </dl>
          </div>

          {/* Logistics */}
          <LogisticsSection booking={booking} />
        </div>

        {/* Right: escrow + actions */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-ink">Zaštita plaćanja</h2>
            <p className="mt-1 text-xs text-muted">{ESCROW_LABELS[booking.escrowState]}</p>
            <div className="mt-4">
              <EscrowStepper
                status={booking.status}
                escrowState={booking.escrowState}
                orientation="vertical"
              />
            </div>
          </div>

          <div className="card p-6">
            <BookingActions
              bookingId={booking.id}
              status={booking.status}
              escrowState={booking.escrowState}
              date={booking.date}
              feeTotal={booking.feeTotal}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function LogisticsSection({ booking }: { booking: BookingWithArtist }) {
  const isDiaspora = booking.market === "DIASPORA";
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-bold text-ink">Logistika</h2>
        {isDiaspora && <span className="chip chip-diaspora">Na nama</span>}
      </div>
      {isDiaspora ? (
        <ul className="mt-3 space-y-2 text-sm">
          <LogiItem icon="🚐" label="Prevoz" value={booking.logisticsTransport} />
          <LogiItem icon="🏨" label="Smeštaj" value={booking.logisticsStay} />
          <LogiItem icon="📄" label="Papiri / prijava rada" value={booking.logisticsPapers} />
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Nastup u zemlji — logistika nije potrebna.
        </p>
      )}
    </div>
  );
}

function LogiItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null;
}) {
  return (
    <li className="flex items-start gap-2">
      <span>{icon}</span>
      <div>
        <span className="font-medium text-ink">{label}: </span>
        <span className="text-ink-soft">{value ?? "biće definisano"}</span>
      </div>
    </li>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? "font-semibold text-ink" : "text-ink-soft"}>{label}</dt>
      <dd className={strong ? "font-display text-lg font-bold text-ink" : "font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}
