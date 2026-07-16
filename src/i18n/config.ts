export const LOCALES = ["sr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "sr";
export const LOCALE_COOKIE = "gaza_locale";

export const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  sr: { label: "Srpski", flag: "🇷🇸" },
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "Deutsch", flag: "🇩🇪" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
