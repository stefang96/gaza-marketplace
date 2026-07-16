"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { useT } from "@/i18n/provider";
import type { BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = [
  "NEW",
  "PENDING_CONFIRM",
  "CONFIRMED",
  "DECLINED",
  "COMPLETED",
  "CANCELLED",
];

export function InboxFilters() {
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

  const market = params.get("trziste") ?? "";
  const status = params.get("status") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-[12px] bg-surface-2 p-1">
        <FilterBtn active={market === ""} onClick={() => setParam("trziste", "")}>
          {t.panel.filterAll}
        </FilterBtn>
        <FilterBtn active={market === "DOMESTIC"} onClick={() => setParam("trziste", "DOMESTIC")}>
          {t.markets.DOMESTIC}
        </FilterBtn>
        <FilterBtn active={market === "DIASPORA"} onClick={() => setParam("trziste", "DIASPORA")}>
          ✈ {t.markets.DIASPORA}
        </FilterBtn>
      </div>

      <select
        className="input max-w-[190px]"
        value={status}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">{t.panel.filterAllStatuses}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t.statuses[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterBtn({
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
      className={`rounded-[9px] px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
