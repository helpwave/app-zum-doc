import { useRef, useState } from 'react'
import type { FileInputItem } from '@helpwave/hightide'
import { ActionCard, Button, FileInput, FormFieldLayout, Input } from '@helpwave/hightide'
import {
  arrayBufferToBase64,
  arrayBuffersEqual,
  createEncryptedKeyPairFile,
  parseEncryptedKeyPairFile,
  publicKeyFromEncryptedKeyPair,
  stringifyEncryptedKeyPairFile,
  unlockEncryptedPrivateKey,
  verifyPasswordForKeyPair,
  type EncryptedKeyPairFile
} from '@app-zum-doc/utils/api'
import { useUploadPracticePublicKey } from '@app-zum-doc/utils/hooks'
import { useEncryption } from '@/components/encryption/encryption-context'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import {
  downloadEncryptionKeyFile,
  writeEncryptedKeyPair
} from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

type KeySetupMode = 'upload' | 'create'
type CreateProgressStep = 1 | 2 | 3

function waitForUi(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 50)
  })
}

export function KeySetupStep({
  onCompleted,
}: {
  onCompleted: () => void,
}) {
  const t = useAdministrationTranslation()
  const { publicKey, setPublicKey } = useEncryption()
  const uploadPublicKey = useUploadPracticePublicKey()
  const [mode, setMode] = useState<KeySetupMode>()
  const [file, setFile] = useState<EncryptedKeyPairFile>()
  const [fileInput, setFileInput] = useState<FileInputItem>()
  const [fileError, setFileError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [uploadPassword, setUploadPassword] = useState('')
  const [isTestingPassword, setIsTestingPassword] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [createProgress, setCreateProgress] = useState<CreateProgressStep>()
  const [createError, setCreateError] = useState<string>()
  const [isCreating, setIsCreating] = useState(false)
  const hadServerPublicKey = useRef(publicKey != null)
  const canCreate = createPassword.length >= 4 && createPassword === createPasswordConfirm
  const publicKeysMatch = file != null && (
    publicKey == null
    || arrayBuffersEqual(publicKey, publicKeyFromEncryptedKeyPair(file))
  )
  const canTestPassword = file != null
    && uploadPassword.length > 0
    && publicKeysMatch
    && !isTestingPassword
    && !isValidated

  const selectMode = (next: KeySetupMode) => {
    setMode(next)
    setFileError(undefined)
    setPasswordError(undefined)
    setCreateError(undefined)
    setIsValidated(false)
  }

  const onFileText = async (fileInput: FileInputItem) => {
    setFileInput(fileInput)
    setIsValidated(false)
    setUploadPassword('')
    setPasswordError(undefined)
    const text = await fileInput?.file?.text()
    const parsed = parseEncryptedKeyPairFile(text ?? '')
    if (!parsed) {
      setFile(undefined)
      setFileError(t('onboardingKeyFileInvalid'))
      return
    }
    if (publicKey != null && !arrayBuffersEqual(publicKey, publicKeyFromEncryptedKeyPair(parsed))) {
      setFile(parsed)
      setFileError(t('onboardingPublicKeyMismatch'))
      return
    }
    setFile(parsed)
    setFileError(undefined)
  }

  const onTestPassword = async () => {
    if (!canTestPassword || file == null) {
      return
    }
    setIsTestingPassword(true)
    try {
      const privateKey = await unlockEncryptedPrivateKey(file, uploadPassword)
      const matches = await verifyPasswordForKeyPair(
        publicKeyFromEncryptedKeyPair(file),
        privateKey
      )
      if (!matches) {
        setPasswordError(t('onboardingPasswordInvalid'))
        setIsValidated(false)
        return
      }
      writeEncryptedKeyPair(file)
      setPublicKey(publicKeyFromEncryptedKeyPair(file))
      if (!hadServerPublicKey.current) {
        await uploadPublicKey.mutateAsync(arrayBufferToBase64(publicKeyFromEncryptedKeyPair(file)))
      }
      setPasswordError(undefined)
      setIsValidated(true)
    } catch {
      setPasswordError(t('onboardingPasswordInvalid'))
      setIsValidated(false)
    } finally {
      setIsTestingPassword(false)
    }
  }

  const onCreateKey = async () => {
    if (!canCreate || isCreating) {
      return
    }
    setCreateError(undefined)
    setIsCreating(true)
    try {
      setCreateProgress(1)
      await waitForUi()
      const created = await createEncryptedKeyPairFile(createPassword)
      setCreateProgress(2)
      await waitForUi()
      writeEncryptedKeyPair(created.file)
      await uploadPublicKey.mutateAsync(arrayBufferToBase64(created.publicKey))
      setPublicKey(created.publicKey)
      setCreateProgress(3)
      await waitForUi()
      downloadEncryptionKeyFile(stringifyEncryptedKeyPairFile(created.file))
      onCompleted()
    } catch {
      setCreateError(t('onboardingKeyCreateFailed'))
      setCreateProgress(undefined)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <OnboardingScreen
      title={t('onboardingKeySetupTitle')}
      footer={mode === 'upload' ? (
        <Button
          type="button"
          color="primary"
          disabled={!isValidated}
          onClick={onCompleted}
        >
          {t('onboardingContinue')}
        </Button>
      ) : undefined}
    >
      <div className="flex-col-4 w-full">
        <ActionCard
          title={t('onboardingUploadKeypair')}
          description={t('onboardingUploadKeypairDescription')}
          className={mode === 'upload' ? 'ring-2 ring-primary' : undefined}
          onClick={() => selectMode('upload')}
        />
        {mode === 'upload' && (
          <div className="flex-col-4 w-full">
            <FormFieldLayout label={t('onboardingKeyFile')} invalidDescription={fileError}>
              {() => (
                <FileInput
                  value={fileInput ? [fileInput] : []}
                  onEditComplete={files => {
                    if(files.length > 0) {
                      onFileText(files[0])
                    }
                  }}
                  accept={['.json','application/json']}
                  maxFiles={1}
                />
              )}
            </FormFieldLayout>
            <FormFieldLayout
              label={t('onboardingPasswordLabel')}
              invalidDescription={passwordError}
            >
              {({ id }) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  value={uploadPassword}
                  invalid={passwordError != null}
                  disabled={file == null || !publicKeysMatch}
                  onValueChange={(value) => {
                    setUploadPassword(value)
                    setIsValidated(false)
                    setPasswordError(undefined)
                  }}
                />
              )}
            </FormFieldLayout>
            <div className="flex-row-3 items-center">
              <Button
                type="button"
                color="primary"
                disabled={!canTestPassword}
                isProcessing={isTestingPassword || uploadPublicKey.isPending}
                onClick={() => void onTestPassword()}
              >
                {t('onboardingTestPassword')}
              </Button>
              {isValidated && (
                <span className="text-positive">{t('onboardingValidationSuccessful')}</span>
              )}
            </div>
          </div>
        )}

        <ActionCard
          title={(
            <span className={publicKey == null ? undefined : 'text-negative'}>
              {publicKey == null ? t('onboardingCreateKeypair') : t('onboardingResetKeypair')}
            </span>
          )}
          description={(
            <span className={publicKey == null ? undefined : 'text-negative'}>
              {publicKey == null
                ? t('onboardingCreateKeypairDescription')
                : t('onboardingResetKeypairDescription')}
            </span>
          )}
          className={mode === 'create' ? 'ring-2 ring-primary' : undefined}
          onClick={() => selectMode('create')}
        />
        {mode === 'create' && (
          <div className="flex-col-4 w-full">
            <FormFieldLayout label={t('onboardingPasswordLabel')}>
              {({ id }) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  value={createPassword}
                  disabled={isCreating}
                  onValueChange={setCreatePassword}
                />
              )}
            </FormFieldLayout>
            <FormFieldLayout label={t('onboardingPasswordConfirmLabel')}>
              {({ id }) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  value={createPasswordConfirm}
                  disabled={isCreating}
                  onValueChange={setCreatePasswordConfirm}
                />
              )}
            </FormFieldLayout>
            <Button
              type="button"
              color={publicKey == null ? 'primary' : 'negative'}
              disabled={!canCreate}
              isProcessing={isCreating}
              onClick={() => void onCreateKey()}
            >
              {t('onboardingCreateEncryptionKey')}
            </Button>
            {createProgress != null && (
              <div className="flex-col-2">
                <span className={createProgress === 1 ? 'text-primary' : 'text-description'}>
                  {t('onboardingCreatingKey')}
                </span>
                <span className={createProgress === 2 ? 'text-primary' : 'text-description'}>
                  {t('onboardingUploadingKey')}
                </span>
                <span className={createProgress === 3 ? 'text-primary' : 'text-description'}>
                  {t('onboardingDownloadingKey')}
                </span>
              </div>
            )}
            {createError && (
              <p className="text-warning">{createError}</p>
            )}
          </div>
        )}
      </div>
    </OnboardingScreen>
  )
}
