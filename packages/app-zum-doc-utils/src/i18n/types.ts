import type {
  HightideTranslationEntries,
  HightideTranslationLocales,
} from "@helpwave/hightide-utils/i18n"
import type {
  AppZumDocTranslationEntries,
  AppZumDocTranslationLocales,
} from "./translations"

export type AppTranslationLocales =
  AppZumDocTranslationLocales & HightideTranslationLocales

export type AppTranslationEntries =
  AppZumDocTranslationEntries & HightideTranslationEntries
