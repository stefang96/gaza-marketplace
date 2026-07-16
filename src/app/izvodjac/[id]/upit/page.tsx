import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getArtistById } from "@/lib/db/queries";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { BookingForm } from "@/features/organizer/BookingForm";

export const metadata = { title: "Novi upit · Gaža" };

export default async function BookingRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) redirect(`/prijava?next=/izvodjac/${id}/upit`);
  if (user.role !== "ORGANIZER") redirect("/panel");

  const [data, { t }] = await Promise.all([getArtistById(id), getT()]);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href={`/izvodjac/${id}`} className="text-sm text-muted hover:text-ink">
        ← {t.bookingForm.backToProfile}
      </Link>
      <div className="mt-4">
        <BookingForm
          artistId={data.artist.id}
          artistName={data.artist.name}
          priceFrom={data.artist.priceFrom}
        />
      </div>
    </div>
  );
}
