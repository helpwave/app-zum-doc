import { useState } from 'react'
import { Button, FormFieldLayout, Input } from '@helpwave/hightide'
import {
  unlockEncryptedPrivateKey,
  verifyPasswordForKeyPair
} from '@app-zum-doc/utils/api'
import { useEncryption } from '@/components/encryption/encryption-context'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { readEncryptedKeyPair } from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function PasswordPromptStep({
  onCompleted,
  onResetEncryptionKey,
}: {
  onCompleted: () => void,
  onResetEncryptionKey: () => void,
}) {
  const t = useAdministrationTranslation()
  const { publicKey, setPrivateKey } = useEncryption()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [isChecking, setIsChecking] = useState(false)

  const onLogin = async () => {
    if (password.length === 0 || isChecking) {
      return
    }
    setError(undefined)
    setIsChecking(true)
    try {
      const file = readEncryptedKeyPair()
      if (!file || publicKey == null) {
        setError(t('onboardingPasswordInvalid'))
        return
      }
      const privateKey = await unlockEncryptedPrivateKey(file, password)
      const matches = await verifyPasswordForKeyPair(publicKey, privateKey)
      if (!matches) {
        setError(t('onboardingPasswordInvalid'))
        return
      }
      setPrivateKey(privateKey)
      onCompleted()
    } catch {
      setError(t('onboardingPasswordInvalid'))
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <OnboardingScreen
      title={t('onboardingPasswordTitle')}
      description={t('onboardingPasswordDescription')}
      footer={(
        <>
          <Button
            type="button"
            color="negative"
            coloringStyle="text"
            className="!min-w-0"
            onClick={onResetEncryptionKey}
          >
            {t('onboardingResetEncryptionKey')}
          </Button>
          <Button
            type="button"
            color="primary"
            disabled={password.length === 0}
            isProcessing={isChecking}
            onClick={() => void onLogin()}
          >
            {t('onboardingLogin')}
          </Button>
        </>
      )}
    >
      <FormFieldLayout
        label={t('onboardingPasswordLabel')}
        invalidDescription={error}
      >
        {({ id }) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            value={password}
            invalid={error != null}
            onValueChange={(value) => {
              setPassword(value)
              setError(undefined)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void onLogin()
              }
            }}
          />
        )}
      </FormFieldLayout>
    </OnboardingScreen>
  )
}
