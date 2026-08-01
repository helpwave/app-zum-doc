import { useTranslation } from "@helpwave/hightide-native/global-contexts"
import type {
  AppTranslationEntries,
  AppTranslationLocales,
} from "@app-zum-doc/utils/i18n"

export function useAppTranslation() {
  return useTranslation<AppTranslationLocales, AppTranslationEntries>()
}
