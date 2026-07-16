import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { ArtistForm } from "@/features/manager/ArtistForm";

export const metadata = { title: "Novi izvođač · Gaža" };

export default async function NewArtistPage() {
  const user = await getSessionUser();
  if (!user) redirect("/prijava?next=/panel/izvodjaci/novi");
  if (user.role === "ORGANIZER") redirect("/pretraga");
  const { t } = await getT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/panel/izvodjaci" className="text-sm text-muted hover:text-ink">
        ← {t.manage.backToRoster}
      </Link>
      <h1 className="mt-2 mb-5 font-display text-3xl font-bold text-ink">{t.manage.newTitle}</h1>
      <ArtistForm />
    </div>
  );
}
