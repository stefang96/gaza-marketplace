"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DOMESTIC_CITIES, DIASPORA_CITIES } from "@/lib/constants";
import { useT } from "@/i18n/provider";
import type { Genre } from "@/lib/types";

const CITIES = [...DOMESTIC_CITIES, ...DIASPORA_CITIES];
const GENRE_KEYS: Genre[] = ["NAROD", "TRUBACI", "COVER", "DJ", "POPFOLK", "TAMBURASI"];

// Live filters: change a control -> update the URL query -> server re-queries.
export function SearchFilters() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const tip = params.get("tip") ?? "privatno";
  const genre = params.get("zanr") ?? "";
  const city = params.get("grad") ?? "";
  const budget = params.get("budzet") ?? "";

  return (
    <div className="card p-4 sm:p-5">
      {/* Event-type toggle: privatna proslava / lokal-klub */}
      <div className="mb-4 inline-flex rounded-[12px] bg-surface-2 p-1">
        <ToggleBtn active={tip === "privatno"} onClick={() => setParam("tip", "privatno")}>
          {t.search.typePrivate}
        </ToggleBtn>
        <ToggleBtn active={tip === "klub"} onClick={() => setParam("tip", "klub")}>
          {t.search.typeClub}
        </ToggleBtn>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="zanr">
            {t.search.genre}
          </label>
          <select
            id="zanr"
            className="input"
            value={genre}
            onChange={(e) => setParam("zanr", e.target.value)}
          >
            <option value="">{t.search.allGenres}</option>
            {GENRE_KEYS.map((g) => (
              <option key={g} value={g}>
                {t.genres[g]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="grad">
            {t.search.city}
          </label>
          <select
            id="grad"
            className="input"
            value={city}
            onChange={(e) => setParam("grad", e.target.value)}
          >
            <option value="">{t.search.allCities}</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="datum">
            {t.search.date}
          </label>
          <input
            id="datum"
            type="date"
            className="input"
            defaultValue={params.get("datum") ?? ""}
            onChange={(e) => setParam("datum", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="budzet">
            {t.search.budget}
          </label>
          <input
            id="budzet"
            type="number"
            min={0}
            step={100}
            className="input"
            placeholder={t.search.budgetPlaceholder}
            defaultValue={budget}
            onChange={(e) => setParam("budzet", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({
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
