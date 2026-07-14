import { getArtists } from "@/lib/db/queries";
import { SearchFilters } from "@/features/organizer/SearchFilters";
import { ArtistCard } from "@/features/organizer/ArtistCard";
import type { Genre } from "@/lib/types";

export const metadata = { title: "Pretraga bendova · Gaža" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const artists = await getArtists({
    genre: (sp.zanr as Genre) || undefined,
    city: sp.grad || undefined,
    maxPrice: sp.budzet ? parseInt(sp.budzet, 10) : undefined,
    q: sp.q || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Pronađi bend</h1>
        <p className="mt-1 text-muted">
          Filtriraj po žanru, gradu, datumu i budžetu — pa pošalji upit uz zaštitu
          plaćanja.
        </p>
      </div>

      <SearchFilters />

      <div className="mt-6 mb-3 text-sm text-muted">
        {artists.length} {artists.length === 1 ? "izvođač" : "izvođača"} pronađeno
      </div>

      {artists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-3 text-4xl">🎷</div>
      <h3 className="font-display text-lg font-bold text-ink">
        Nema izvođača za ove filtere
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Probaj da proširiš budžet ili promeniš žanr/grad.
      </p>
    </div>
  );
}
