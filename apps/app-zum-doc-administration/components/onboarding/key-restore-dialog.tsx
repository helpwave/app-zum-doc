import { useState } from 'react'
import { Button, Dialog } from '@helpwave/hightide'
import {
  decryptWithPrivateKey,
  encryptionTestPlaintext,
  parseEncryptionKeyFile
} from '@app-zum-doc/utils/api'
import { useEncryptionKeyTest } from '@app-zum-doc/utils/hooks'
import { KeyFileField } from '@/components/onboarding/key-file-field'
import { writeEncryptionKey } from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function KeyRestoreDialog({
  isOpen,
  onUnlocked,
}: {
  isOpen: boolean,
  onUnlocked: () => void,
}) {
  const t = useAdministrationTranslation()
  const testKey = useEncryptionKeyTest()
  const [fileName, setFileName] = useState<string>()
  const [fileText, setFileText] = useState<string>()
  const [error, setError] = useState<string>()

  const canSubmit = fileText != null && !testKey.isPending

  const onSubmit = async () => {
    if (!fileText) {
      return
    }
    const privateKey = parseEncryptionKeyFile(fileText).privateKey ?? fileText
    setError(undefined)
    try {
      const { ciphertext } = await testKey.mutateAsync()
      const plaintext = await decryptWithPrivateKey(privateKey, ciphertext)
      if (plaintext !== encryptionTestPlaintext) {
        setError(t('onboardingKeyInvalid'))
        return
      }
      writeEncryptionKey(privateKey)
      onUnlocked()
    } catch {
      setError(t('onboardingKeyInvalid'))
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      isModal={false}
      titleElement={t('onboardingKeyRestoreTitle')}
      description={t('onboardingKeyRestoreDescription')}
      className="w-full max-w-lg"
    >
      <div className="flex-col-4">
        <KeyFileField
          label={t('uploadPrivateKey')}
          fileName={fileName}
          onFileText={(text, name) => {
            setFileText(text)
            setFileName(name)
            setError(undefined)
          }}
        />
        {error && (
          <p className="text-warning">{error}</p>
        )}
        <Button
          type="button"
          color="primary"
          disabled={!canSubmit}
          isProcessing={testKey.isPending}
          onClick={() => void onSubmit()}
        >
          {t('onboardingContinue')}
        </Button>
      </div>
    </Dialog>
  )
}
