import { sr, type Dictionary } from "./sr";
import { en } from "./en";
import { de } from "./de";
import { DEFAULT_LOCALE, type Locale } from "../config";

export const dictionaries: Record<Locale, Dictionary> = { sr, en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type { Dictionary };
