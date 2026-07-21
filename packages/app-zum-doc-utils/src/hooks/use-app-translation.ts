import { useTranslation } from "@helpwave/hightide-utils/context/translation"
import type {
  HightideTranslationEntries,
  HightideTranslationLocales,
} from "@helpwave/hightide-utils/i18n"
import type {
  AppZumDocTranslationEntries,
  AppZumDocTranslationLocales,
} from "../i18n/translations"

export type AppTranslationLocales =
  AppZumDocTranslationLocales & HightideTranslationLocales

export type AppTranslationEntries =
  AppZumDocTranslationEntries & HightideTranslationEntries

export function useAppTranslation() {
  return useTranslation<AppTranslationLocales, AppTranslationEntries>()
}
