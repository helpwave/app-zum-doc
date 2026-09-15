import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import { parseEncryptionKeyFile } from '@app-zum-doc/utils/api'
import { usePracticeOnboardingStatus } from '@app-zum-doc/utils/hooks'
import { KeyRestoreDialog } from '@/components/onboarding/key-restore-dialog'
import { OnboardingLoadingScreen } from '@/components/onboarding/onboarding-loading-screen'
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper'
import { QueryState } from '@/components/layout/Page'
import { readEncryptionKey } from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

function hasPrivateKeyInStorage(): boolean {
  const stored = readEncryptionKey()
  if (!stored) {
    return false
  }
  return parseEncryptionKeyFile(stored).privateKey != null || stored.includes('BEGIN PRIVATE KEY')
}

export function OnboardingGate({
  children,
}: {
  children: ReactNode,
}) {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const [hasLocalKey, setHasLocalKey] = useState<boolean | null>(null)
  const statusQuery = usePracticeOnboardingStatus({
    enabled: hasLocalKey != null,
  })
  const status = statusQuery.data

  useEffect(() => {
    setHasLocalKey(hasPrivateKeyInStorage())
  }, [])

  const onUnlocked = () => {
    setHasLocalKey(true)
    void statusQuery.refetch()
  }

  const onOnboardingCompleted = () => {
    setHasLocalKey(hasPrivateKeyInStorage())
    void statusQuery.refetch().then(() => {
      void router.replace('/')
    })
  }

  if (hasLocalKey == null || statusQuery.isPending) {
    return <OnboardingLoadingScreen />
  }

  if (statusQuery.isError || !status) {
    return (
      <div className="flex items-center justify-center w-full h-dvh p-6">
        <QueryState
          isPending={false}
          isError
          error={statusQuery.error}
          onRetry={() => void statusQuery.refetch()}
          loadingLabel={t('onboardingLoading')}
        >
          <span />
        </QueryState>
      </div>
    )
  }

  const needsKeySetup = !status.hasPublicKey
  const needsKeyRestore = status.hasPublicKey && !hasLocalKey
  const needsPracticeSetup = !status.hasDoctorsOffice

  if (!needsKeySetup && !needsKeyRestore && !needsPracticeSetup) {
    return <>{children}</>
  }

  if (needsKeyRestore) {
    return (
      <>
        <OnboardingLoadingScreen />
        <KeyRestoreDialog isOpen onUnlocked={onUnlocked} />
      </>
    )
  }

  return (
    <OnboardingStepper
      needsKeySetup={needsKeySetup}
      needsPracticeSetup={needsPracticeSetup}
      onCompleted={onOnboardingCompleted}
    />
  )
}
