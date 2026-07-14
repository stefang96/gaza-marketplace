import Link from "next/link";

export const metadata = { title: "Za izvođače · Gaža" };

export default function ForArtistsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <span className="chip chip-diaspora mb-4">Za izvođače i menadžere</span>
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">
          Više gaža. Siguran novac. Bez papirologije.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Napravi profil, primaj upite iz zemlje i dijaspore i naplati bez brige.
          Za inostranstvo mi sređujemo prevoz, smeštaj i prijavu rada.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/registracija" className="btn-primary px-5 py-3 text-base">
            Napravi profil
          </Link>
          <Link href="/prijava" className="btn-secondary px-5 py-3 text-base">
            Prijava
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <Benefit
          title="Siguran novac"
          body="Kapara stoji u escrow-u i pušta se čim odsviraš. Nema više „javiće se posle“."
          accent="green"
        />
        <Benefit
          title="Više gaža"
          body="Vidljiv si naručiocima iz cele dijaspore — Beč, Frankfurt, Cirih, Malme…"
          accent="accent"
        />
        <Benefit
          title="Logistika na nama"
          body="Prevoz, smeštaj i papiri za nastup u inostranstvu — organizujemo umesto tebe."
          accent="blue"
        />
      </div>

      <div className="mt-12 card p-6">
        <h2 className="font-display text-xl font-bold text-ink">Menadžer? Vodi ceo roster.</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Jedan nalog, više izvođača, jedinstven inbox svih upita — sa oznakom „U
          zemlji / Dijaspora“ i filterima po statusu.
        </p>
      </div>
    </div>
  );
}

function Benefit({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: "green" | "accent" | "blue";
}) {
  const dot = { green: "bg-green", accent: "bg-accent", blue: "bg-blue" }[accent];
  return (
    <div className="card p-6">
      <span className={`mb-4 inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
