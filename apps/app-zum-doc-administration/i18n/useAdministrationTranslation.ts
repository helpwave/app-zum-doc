import { useLocalization, useTranslation } from '@helpwave/hightide'
import type {
  AdministrationTranslationEntries,
  AdministrationTranslationLocales,
} from '@/i18n/translations'

export const useAdministrationTranslation = () => {
  return useTranslation<
    AdministrationTranslationLocales,
    AdministrationTranslationEntries
  >()
}

export const useLocale = useLocalization
