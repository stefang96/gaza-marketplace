import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getArtistById, getArtistsByManager } from "@/lib/db/queries";
import { getT } from "@/i18n/server";
import { ArtistForm } from "@/features/manager/ArtistForm";
import { AvailabilityManager } from "@/features/manager/AvailabilityManager";

export const metadata = { title: "Izmena izvođača · Gaža" };

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/prijava?next=/panel/izvodjaci/${id}/izmena`);
  if (user.role === "ORGANIZER") redirect("/pretraga");

  const [data, myArtists, { t }] = await Promise.all([
    getArtistById(id),
    getArtistsByManager(user.id),
    getT(),
  ]);
  if (!data) notFound();
  if (!myArtists.some((a) => a.id === id)) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/panel/izvodjaci" className="text-sm text-muted hover:text-ink">
          ← {t.manage.backToRoster}
        </Link>
        <Link href={`/izvodjac/${id}`} className="text-sm font-medium text-accent hover:underline">
          {t.header.artists} →
        </Link>
      </div>
      <h1 className="mt-2 mb-5 font-display text-3xl font-bold text-ink">
        {t.manage.editTitle}: {data.artist.name}
      </h1>

      <div className="space-y-6">
        <ArtistForm artist={data.artist} />
        <AvailabilityManager artistId={id} slots={data.availability} />
      </div>
    </div>
  );
}
