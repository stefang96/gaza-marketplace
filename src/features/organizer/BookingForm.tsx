"use client";

import { useActionState, useState } from "react";
import {
  createBookingRequest,
  type BookingFormState,
} from "./actions";
import {
  DOMESTIC_CITIES,
  DIASPORA_CITIES,
  BALKAN_COUNTRIES,
  DIASPORA_COUNTRIES,
  COMMISSION_RATE,
  formatEur,
} from "@/lib/constants";
import { useT } from "@/i18n/provider";
import type { Market } from "@/lib/types";

const EMPTY: BookingFormState = { ok: false };

export function BookingForm({
  artistId,
  artistName,
  priceFrom,
}: {
  artistId: string;
  artistName: string;
  priceFrom: number;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(createBookingRequest, EMPTY);
  const [market, setMarket] = useState<Market>("DOMESTIC");

  // Live fee breakdown mirrors server-side computeFees().
  const logisticsFee = market === "DIASPORA" ? 500 : 0;
  const commission = Math.round(priceFrom * COMMISSION_RATE);
  const feeTotal = priceFrom + logisticsFee + commission;

  const cities = market === "DIASPORA" ? DIASPORA_CITIES : DOMESTIC_CITIES;
  const countries = market === "DIASPORA" ? DIASPORA_COUNTRIES : BALKAN_COUNTRIES;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={formAction} className="card p-6">
        <input type="hidden" name="artistId" value={artistId} />
        <input type="hidden" name="market" value={market} />

        <h1 className="font-display text-xl font-bold text-ink">
          {t.bookingForm.titlePrefix} {artistName}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.bookingForm.subtitle}</p>

        {/* Market toggle */}
        <div className="mt-5 inline-flex rounded-[12px] bg-surface-2 p-1">
          <MarketBtn active={market === "DOMESTIC"} onClick={() => setMarket("DOMESTIC")}>
            {t.markets.DOMESTIC}
          </MarketBtn>
          <MarketBtn active={market === "DIASPORA"} onClick={() => setMarket("DIASPORA")}>
            ✈ {t.markets.DIASPORA}
          </MarketBtn>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="eventType">
              {t.bookingForm.eventType}
            </label>
            <select id="eventType" name="eventType" className="input" defaultValue={t.eventTypes[0]}>
              {t.eventTypes.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="date">
              {t.bookingForm.date}
            </label>
            <input id="date" name="date" type="date" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="city">
              {t.bookingForm.city}
            </label>
            <input
              id="city"
              name="city"
              className="input"
              list="city-list"
              placeholder={
                market === "DIASPORA"
                  ? t.bookingForm.cityPlaceholderDiaspora
                  : t.bookingForm.cityPlaceholderDomestic
              }
            />
            <datalist id="city-list">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="country">
              {t.bookingForm.country}
            </label>
            <select key={market} id="country" name="country" className="input" defaultValue="">
              <option value="" disabled>
                {t.bookingForm.chooseCountry}
              </option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="guests">
              {t.bookingForm.guests}
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={0}
              className="input"
              placeholder={t.bookingForm.guestsPlaceholder}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="message">
            {t.bookingForm.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="input"
            placeholder={t.bookingForm.messagePlaceholder}
          />
        </div>

        {state.error && <p className="mt-3 text-sm text-coral">{state.error}</p>}

        <button type="submit" className="btn-primary mt-5 w-full py-3 text-base" disabled={pending}>
          {pending ? t.bookingForm.submitting : t.bookingForm.submit}
        </button>
      </form>

      {/* Sidebar: fee breakdown + escrow explainer */}
      <aside className="space-y-4">
        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-ink">{t.bookingForm.costEstimate}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={t.bookingForm.feeArtist} value={formatEur(priceFrom)} />
            {logisticsFee > 0 && <Row label={t.bookingForm.logistics} value={formatEur(logisticsFee)} />}
            <Row
              label={`${t.bookingForm.commission} (${Math.round(COMMISSION_RATE * 100)}%)`}
              value={formatEur(commission)}
            />
            <div className="my-2 h-px bg-line" />
            <Row label={t.bookingForm.total} value={formatEur(feeTotal)} strong />
          </dl>
          <p className="mt-3 text-xs text-muted">{t.bookingForm.estimateNote}</p>
        </div>

        <div className="card border-green/30 bg-green-soft p-5">
          <div className="flex items-center gap-2 font-semibold text-green">
            <span>🛡️</span> {t.bookingForm.protectionTitle}
          </div>
          <ol className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>{t.bookingForm.protectionStep1}</li>
            <li>{t.bookingForm.protectionStep2}</li>
            <li>{t.bookingForm.protectionStep3}</li>
            <li>{t.bookingForm.protectionStep4}</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function MarketBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[9px] px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? "font-semibold text-ink" : "text-ink-soft"}>{label}</dt>
      <dd className={strong ? "font-display text-lg font-bold text-ink" : "font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}
