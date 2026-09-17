import { Button } from '@helpwave/hightide'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function WelcomeStep({
  onContinue,
}: {
  onContinue: () => void,
}) {
  const t = useAdministrationTranslation()

  return (
    <OnboardingScreen
      title={t('onboardingWelcomeTitle')}
      description={t('onboardingWelcomeDescription')}
      footer={(
        <Button
          type="button"
          color="primary"
          onClick={onContinue}
        >
          {t('onboardingContinue')}
        </Button>
      )}
    />
  )
}
