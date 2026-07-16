"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/i18n/actions";
import { LOCALES, LOCALE_META } from "@/i18n/config";
import { useLocale } from "@/i18n/provider";

export function LocaleSwitcher() {
  const current = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(locale: string) {
    setOpen(false);
    if (locale === current) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="btn-ghost px-2.5 py-2"
        aria-haspopup="menu"
        aria-expanded={open}
        title={LOCALE_META[current].label}
      >
        <span aria-hidden>{LOCALE_META[current].flag}</span>
        <span className="hidden text-sm font-semibold uppercase sm:inline">{current}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-[12px] border border-line bg-surface p-1 shadow-soft-lg"
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              role="menuitemradio"
              aria-checked={l === current}
              onClick={() => choose(l)}
              className={`flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                l === current ? "font-semibold text-ink" : "text-ink-soft"
              }`}
            >
              <span aria-hidden>{LOCALE_META[l].flag}</span>
              <span className="flex-1">{LOCALE_META[l].label}</span>
              {l === current && <span className="text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
