import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="chip chip-diaspora mb-5">
              Balkan i dijaspora · EUR
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
              Svirke bez brige.
              <br />
              Novac{" "}
              <span className="text-accent">osiguran</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Gaža povezuje muzičare i bendove sa naručiocima — za klub, kafanu,
              splav, svadbu i slavu, u zemlji i u dijaspori. Uplata stoji u
              escrow-u dok se ne odsvira, a logistiku za inostranstvo sređujemo mi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/za-organizatore" className="btn-primary px-5 py-3 text-base">
                Tražim bend
              </Link>
              <Link href="/za-izvodjace" className="btn-secondary px-5 py-3 text-base">
                Ja sviram
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <Trust label="Zaštita plaćanja (escrow)" />
              <Trust label="Logistika za dijasporu" />
              <Trust label="Verifikovani izvođači" />
            </div>
          </div>

          <div className="relative">
            <HeroCard />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <ValueCard
            title="Zaštita plaćanja"
            body="Naručilac uplaćuje pre nastupa; novac stoji na čekanju i pušta se izvođaču tek pošto odsvira. Bez „a gde je kapara?“."
            accent="green"
          />
          <ValueCard
            title="Logistika za dijasporu"
            body="Za gaže u inostranstvu sređujemo prevoz, smeštaj i prijavu rada. Vi svirate, papirologija je na nama."
            accent="accent"
          />
          <ValueCard
            title="Jedan inbox"
            body="Menadžeri vode više izvođača i vide sve upite na jednom mestu — u zemlji i u dijaspori."
            accent="blue"
          />
        </div>
      </section>
    </div>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-green">✓</span>
      {label}
    </span>
  );
}

function ValueCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: "green" | "accent" | "blue";
}) {
  const dot = {
    green: "bg-green",
    accent: "bg-accent",
    blue: "bg-blue",
  }[accent];
  return (
    <div className="card p-6">
      <span className={`mb-4 inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="card p-6 shadow-soft-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="chip chip-confirmed">Escrow aktivan</span>
        <span className="text-xs text-muted">Upit #1042</span>
      </div>
      <div className="rounded-[12px] bg-surface-2 p-4">
        <div className="text-sm font-semibold text-ink">Svadba · Beč 🇦🇹</div>
        <div className="text-xs text-muted">18.09.2026. · 180 gostiju</div>
      </div>

      {/* escrow stepper preview */}
      <ol className="mt-5 space-y-3">
        <StepPreview label="Kapara u escrow-u" state="done" />
        <StepPreview label="Nastup" state="active" />
        <StepPreview label="Isplata izvođaču" state="todo" />
      </ol>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-soft">Honorar + logistika</span>
        <span className="font-display text-lg font-bold text-ink">2.760 €</span>
      </div>
    </div>
  );
}

function StepPreview({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "todo";
}) {
  const dot =
    state === "done"
      ? "bg-green text-white"
      : state === "active"
        ? "bg-accent text-white"
        : "bg-surface-2 text-muted border border-line-2";
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${dot}`}
      >
        {state === "done" ? "✓" : ""}
      </span>
      <span
        className={`text-sm ${state === "todo" ? "text-muted" : "font-medium text-ink"}`}
      >
        {label}
      </span>
    </li>
  );
}
