"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { STATUS_LABELS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/types";

const STATUSES = Object.keys(STATUS_LABELS) as BookingStatus[];

export function InboxFilters() {
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
          Sve
        </FilterBtn>
        <FilterBtn active={market === "DOMESTIC"} onClick={() => setParam("trziste", "DOMESTIC")}>
          Balkan
        </FilterBtn>
        <FilterBtn active={market === "DIASPORA"} onClick={() => setParam("trziste", "DIASPORA")}>
          ✈ Dijaspora
        </FilterBtn>
      </div>

      <select
        className="input max-w-[190px]"
        value={status}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">Svi statusi</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
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
