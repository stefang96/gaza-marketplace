import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getManagerBookingById, getArtistsByManager } from "@/lib/db/queries";
import { Avatar } from "@/components/ui/Avatar";
import { StatusChip, MarketChip } from "@/components/ui/StatusChip";
import { EscrowStepper } from "@/components/EscrowStepper";
import {
  ManagerBookingActions,
  MarkSeenOnView,
} from "@/features/manager/ManagerBookingActions";
import { formatEur, formatDate, ESCROW_LABELS } from "@/lib/constants";
import { avatarColorFor } from "@/features/auth/avatarColor";
import type { BookingWithArtist } from "@/lib/types";

export const metadata = { title: "Detalj upita · Panel · Gaža" };

export default async function ManagerBookingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/prijava?next=/panel/upit/${id}`);
  if (user.role === "ORGANIZER") redirect("/pretraga");

  const booking = await getManagerBookingById(id);
  if (!booking) notFound();

  // Ensure this request belongs to one of the manager's artists.
  const myArtists = await getArtistsByManager(user.id);
  if (!myArtists.some((a) => a.id === booking.artistId)) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <MarkSeenOnView bookingId={booking.id} status={booking.status} />

      <Link href="/panel" className="text-sm text-muted hover:text-ink">
        ← Nazad na inbox
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Header */}
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
              <Field label="Tržište" value={<MarketChip market={booking.market} />} />
              <Field label="Datum" value={formatDate(booking.date)} />
              <Field label="Gosti" value={`${booking.guests}`} />
              <Field label="Lokacija" value={`${booking.city}, ${booking.country}`} />
              <Field label="Poslato" value={formatDate(booking.createdAt)} />
            </dl>

            {booking.message && (
              <div className="mt-4 whitespace-pre-line rounded-[12px] bg-surface-2 p-3">
                <div className="text-xs font-medium text-muted">Poruka naručioca</div>
                <p className="mt-1 text-sm text-ink-soft">{booking.message}</p>
              </div>
            )}
          </div>

          {/* Verified organizer */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Naručilac</h2>
            {booking.organizer ? (
              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  name={booking.organizer.name}
                  color={booking.organizer.avatarColor}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">
                      {booking.organizer.name}
                    </span>
                    <span className="chip chip-verified">✓ Verifikovan</span>
                  </div>
                  <div className="text-xs text-muted">
                    Član od {formatDate(booking.organizer.createdAt)}
                    {booking.organizer.phone ? ` · ${booking.organizer.phone}` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Podaci nedostupni.</p>
            )}
          </div>

          {/* Fee breakdown */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Razbijen honorar</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Izvođaču" value={formatEur(booking.feeArtist)} />
              {booking.logisticsFee > 0 && (
                <Row label="Logistika" value={formatEur(booking.logisticsFee)} />
              )}
              <Row label="Provizija (15%)" value={formatEur(booking.commission)} muted />
              <div className="my-1 h-px bg-line" />
              <Row label="Ukupno naručilac plaća" value={formatEur(booking.feeTotal)} strong />
            </dl>
          </div>

          {/* Logistics */}
          <LogisticsSection booking={booking} />
        </div>

        {/* Right: escrow + actions */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-ink">Escrow</h2>
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
            <h2 className="mb-3 font-display text-base font-bold text-ink">Akcije</h2>
            <ManagerBookingActions
              bookingId={booking.id}
              status={booking.status}
              escrowState={booking.escrowState}
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
        <p className="mt-2 text-sm text-muted">Nastup u regionu — logistika nije potrebna.</p>
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

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? "font-semibold text-ink" : muted ? "text-muted" : "text-ink-soft"}>
        {label}
      </dt>
      <dd className={strong ? "font-display text-lg font-bold text-ink" : "font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}
