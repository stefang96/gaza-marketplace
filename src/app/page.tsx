import Link from "next/link";
import { getT } from "@/i18n/server";

export default async function HomePage() {
  const { t } = await getT();
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="chip chip-diaspora mb-5">{t.home.badge}</span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
              {t.home.titleLine1}
              <br />
              {t.home.titleMoney} <span className="text-accent">{t.home.titleSecured}</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">{t.home.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/za-organizatore" className="btn-primary px-5 py-3 text-base">
                {t.home.ctaFindBand}
              </Link>
              <Link href="/za-izvodjace" className="btn-secondary px-5 py-3 text-base">
                {t.home.ctaIPlay}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <Trust label={t.home.trust1} />
              <Trust label={t.home.trust2} />
              <Trust label={t.home.trust3} />
            </div>
          </div>

          <div className="relative">
            <HeroCard
              escrowActive={t.home.heroEscrowActive}
              request={t.home.heroRequest}
              event={t.home.heroEvent}
              meta={t.home.heroMeta}
              step1={t.home.heroStep1}
              step2={t.home.heroStep2}
              step3={t.home.heroStep3}
              feeLabel={t.home.heroFeeLabel}
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <ValueCard title={t.home.value1Title} body={t.home.value1Body} accent="green" />
          <ValueCard title={t.home.value2Title} body={t.home.value2Body} accent="accent" />
          <ValueCard title={t.home.value3Title} body={t.home.value3Body} accent="blue" />
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
  const dot = { green: "bg-green", accent: "bg-accent", blue: "bg-blue" }[accent];
  return (
    <div className="card p-6">
      <span className={`mb-4 inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function HeroCard({
  escrowActive,
  request,
  event,
  meta,
  step1,
  step2,
  step3,
  feeLabel,
}: {
  escrowActive: string;
  request: string;
  event: string;
  meta: string;
  step1: string;
  step2: string;
  step3: string;
  feeLabel: string;
}) {
  return (
    <div className="card p-6 shadow-soft-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="chip chip-confirmed">{escrowActive}</span>
        <span className="text-xs text-muted">{request}</span>
      </div>
      <div className="rounded-[12px] bg-surface-2 p-4">
        <div className="text-sm font-semibold text-ink">{event}</div>
        <div className="text-xs text-muted">{meta}</div>
      </div>

      <ol className="mt-5 space-y-3">
        <StepPreview label={step1} state="done" />
        <StepPreview label={step2} state="active" />
        <StepPreview label={step3} state="todo" />
      </ol>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-soft">{feeLabel}</span>
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
