import { AppZumDocBadge, HelpwaveLogo } from '@helpwave/hightide'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function OnboardingLoadingScreen() {
  const t = useAdministrationTranslation()

  return (
    <div className="flex flex-col items-center justify-center w-full h-dvh p-6">
      <AppZumDocBadge size="lg" className="mb-8" />
      <div className="flex-col-3 items-center">
        <HelpwaveLogo size="lg" animate="loading" />
        <span className="text-description">{t('onboardingLoading')}</span>
      </div>
    </div>
  )
}
