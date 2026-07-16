import Link from "next/link";
import { getT } from "@/i18n/server";

export const metadata = { title: "Za izvođače · Gaža" };

export default async function ForArtistsPage() {
  const { t } = await getT();
  const f = t.forArtists;
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <span className="chip chip-diaspora mb-4">{f.badge}</span>
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">{f.title}</h1>
        <p className="mt-4 text-lg text-ink-soft">{f.subtitle}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/registracija" className="btn-primary px-5 py-3 text-base">
            {f.ctaProfile}
          </Link>
          <Link href="/prijava" className="btn-secondary px-5 py-3 text-base">
            {f.ctaLogin}
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <Benefit title={f.b1Title} body={f.b1Body} accent="green" />
        <Benefit title={f.b2Title} body={f.b2Body} accent="accent" />
        <Benefit title={f.b3Title} body={f.b3Body} accent="blue" />
      </div>

      <div className="mt-12 card p-6">
        <h2 className="font-display text-xl font-bold text-ink">{f.sectionTitle}</h2>
        <p className="mt-2 text-sm text-ink-soft">{f.sectionBody}</p>
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
