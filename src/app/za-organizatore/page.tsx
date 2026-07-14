import Link from "next/link";

export const metadata = { title: "Za organizatore · Gaža" };

export default function ForOrganizersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <span className="chip chip-new mb-4">Za naručioce</span>
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">
          Nađi pravi bend. Plati bezbedno.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Bilo da spremaš svadbu, slavu ili veče u lokalu — pretraži proverene
          izvođače, pošalji upit i uplati u escrow. Novac ide bendu tek kad
          odsvira.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/pretraga" className="btn-primary px-5 py-3 text-base">
            Pretraži bendove
          </Link>
          <Link href="/registracija" className="btn-secondary px-5 py-3 text-base">
            Napravi nalog
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <Step n={1} title="Pretraga" body="Filtriraj po tipu događaja, žanru, gradu, datumu i budžetu." />
        <Step n={2} title="Upit + escrow" body="Pošalji upit; kad bend potvrdi, uplaćuješ kaparu u escrow." />
        <Step n={3} title="Svirka & isplata" body="Bend odsvira, ti potvrdiš, novac se pušta. Bez rizika." />
      </div>

      <div className="mt-12 card p-6">
        <h2 className="font-display text-xl font-bold text-ink">
          Privatna proslava ili lokal?
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Gaža radi za oba. Na pretrazi biraš tip događaja — cenovnik i uslovi se
          prilagođavaju svadbi/slavi ili klupskom/korporativnom nastupu.
        </p>
        <div className="mt-4 flex gap-2">
          <span className="chip chip-neutral">Privatna proslava</span>
          <span className="chip chip-neutral">Lokal · klub</span>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="card p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft font-display font-bold text-accent-strong">
        {n}
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
