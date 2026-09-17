import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import { base64ToArrayBuffer } from '@app-zum-doc/utils/api'
import {
  usePracticeEncryptionData,
  usePracticeOnboardingStatus
} from '@app-zum-doc/utils/hooks'
import { useEncryption } from '@/components/encryption/encryption-context'
import { OnboardingLoadingScreen } from '@/components/onboarding/onboarding-loading-screen'
import {
  OnboardingStepper,
  type OnboardingStepId
} from '@/components/onboarding/onboarding-stepper'
import { QueryState } from '@/components/layout/Page'
import {
  clearEncryptionKey,
  hasEncryptedKeyPair,
  readEncryptionKey
} from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

function resolveOnboardingSteps(options: {
  hasServerPublicKey: boolean,
  hasLocalEncryptedKey: boolean,
  hasDoctorsOffice: boolean,
}): OnboardingStepId[] {
  const steps: OnboardingStepId[] = []
  if (!options.hasServerPublicKey) {
    steps.push('welcome')
  }
  if (!options.hasLocalEncryptedKey) {
    steps.push('keys')
  }
  steps.push('password')
  if (!options.hasDoctorsOffice) {
    steps.push('office')
  }
  return steps
}

export function OnboardingGate({
  children,
}: {
  children: ReactNode,
}) {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const { setPublicKey, privateKey } = useEncryption()
  const encryptionQuery = usePracticeEncryptionData()
  const statusQuery = usePracticeOnboardingStatus()
  const [steps, setSteps] = useState<OnboardingStepId[]>()
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!encryptionQuery.isSuccess || !statusQuery.isSuccess || steps != null) {
      return
    }
    const serverPublicKey = encryptionQuery.data.publicKey
    if (serverPublicKey) {
      setPublicKey(base64ToArrayBuffer(serverPublicKey))
    }
    let hasLocalEncryptedKey = hasEncryptedKeyPair()
    if (serverPublicKey == null && readEncryptionKey() != null) {
      clearEncryptionKey()
      hasLocalEncryptedKey = false
    }
    setSteps(resolveOnboardingSteps({
      hasServerPublicKey: serverPublicKey != null,
      hasLocalEncryptedKey,
      hasDoctorsOffice: statusQuery.data.hasDoctorsOffice,
    }))
  }, [
    encryptionQuery.data,
    encryptionQuery.isSuccess,
    setPublicKey,
    statusQuery.data,
    statusQuery.isSuccess,
    steps,
  ])

  const onCompleted = () => {
    setIsComplete(true)
    void statusQuery.refetch()
    void encryptionQuery.refetch()
    void router.replace('/')
  }

  if (privateKey != null && isComplete) {
    return <>{children}</>
  }

  if (encryptionQuery.isPending || statusQuery.isPending || steps == null) {
    if (encryptionQuery.isError || statusQuery.isError) {
      return (
        <div className="flex items-center justify-center w-full h-dvh p-6">
          <QueryState
            isPending={false}
            isError
            error={encryptionQuery.error ?? statusQuery.error}
            onRetry={() => {
              void encryptionQuery.refetch()
              void statusQuery.refetch()
            }}
            loadingLabel={t('onboardingLoading')}
          >
            <span />
          </QueryState>
        </div>
      )
    }
    return <OnboardingLoadingScreen />
  }

  return (
    <OnboardingStepper
      steps={steps}
      onCompleted={onCompleted}
    />
  )
}
