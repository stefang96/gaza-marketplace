import Link from "next/link";
import { getT } from "@/i18n/server";

export const metadata = { title: "Za organizatore · Gaža" };

export default async function ForOrganizersPage() {
  const { t } = await getT();
  const f = t.forOrganizers;
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <span className="chip chip-new mb-4">{f.badge}</span>
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">{f.title}</h1>
        <p className="mt-4 text-lg text-ink-soft">{f.subtitle}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/pretraga" className="btn-primary px-5 py-3 text-base">
            {f.ctaSearch}
          </Link>
          <Link href="/registracija" className="btn-secondary px-5 py-3 text-base">
            {f.ctaRegister}
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <Step n={1} title={f.step1Title} body={f.step1Body} />
        <Step n={2} title={f.step2Title} body={f.step2Body} />
        <Step n={3} title={f.step3Title} body={f.step3Body} />
      </div>

      <div className="mt-12 card p-6">
        <h2 className="font-display text-xl font-bold text-ink">{f.sectionTitle}</h2>
        <p className="mt-2 text-sm text-ink-soft">{f.sectionBody}</p>
        <div className="mt-4 flex gap-2">
          <span className="chip chip-neutral">{f.chipPrivate}</span>
          <span className="chip chip-neutral">{f.chipClub}</span>
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
