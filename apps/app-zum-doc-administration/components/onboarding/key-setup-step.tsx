import { useEffect, useState } from 'react'
import { Button, Chip } from '@helpwave/hightide'
import {
  encryptionKeysMatch,
  generateEncryptionKeyPair,
  parseEncryptionKeyFile,
  type EncryptionKeyPair
} from '@app-zum-doc/utils/api'
import { useUploadPracticePublicKey } from '@app-zum-doc/utils/hooks'
import { KeyFileField } from '@/components/onboarding/key-file-field'
import {
  downloadEncryptionKeyFile,
  writeEncryptionKey
} from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

type SetupMode = 'create' | 'upload'

export function KeySetupStep({
  onCompleted,
}: {
  onCompleted: () => void,
}) {
  const t = useAdministrationTranslation()
  const uploadPublicKey = useUploadPracticePublicKey()
  const [mode, setMode] = useState<SetupMode>('create')
  const [pair, setPair] = useState<EncryptionKeyPair>()
  const [hasDownloaded, setHasDownloaded] = useState(false)
  const [publicFileName, setPublicFileName] = useState<string>()
  const [privateFileName, setPrivateFileName] = useState<string>()
  const [uploadedPublicKey, setUploadedPublicKey] = useState<string>()
  const [uploadedPrivateKey, setUploadedPrivateKey] = useState<string>()
  const [error, setError] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  const uploadPublicKeyMutate = uploadPublicKey.mutateAsync

  useEffect(() => {
    if (mode !== 'create' || pair != null) {
      return
    }
    let cancelled = false
    setIsGenerating(true)
    void generateEncryptionKeyPair()
      .then(async (next) => {
        if (cancelled) {
          return
        }
        await uploadPublicKeyMutate(next.publicKey)
        if (cancelled) {
          return
        }
        writeEncryptionKey(next.privateKey)
        setPair(next)
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('onboardingKeyCreateFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsGenerating(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [mode, pair, t, uploadPublicKeyMutate])

  const uploadedPairReady = uploadedPublicKey != null && uploadedPrivateKey != null
  const canContinue = mode === 'create'
    ? pair != null && hasDownloaded && !uploadPublicKey.isPending
    : uploadedPairReady && !uploadPublicKey.isPending

  const applyUploadedFile = (
    kind: 'public' | 'private',
    text: string,
    name: string
  ) => {
    const parsed = parseEncryptionKeyFile(text)
    if (kind === 'public') {
      setPublicFileName(name)
      setUploadedPublicKey(parsed.publicKey ?? text)
    } else {
      setPrivateFileName(name)
      setUploadedPrivateKey(parsed.privateKey ?? text)
    }
    setError(undefined)
  }

  const onContinue = async () => {
    setError(undefined)
    try {
      if (mode === 'create') {
        if (!pair || !hasDownloaded) {
          return
        }
        onCompleted()
        return
      }
      if (!uploadedPublicKey || !uploadedPrivateKey) {
        return
      }
      const matches = await encryptionKeysMatch(uploadedPublicKey, uploadedPrivateKey)
      if (!matches) {
        setError(t('onboardingKeyInvalid'))
        return
      }
      await uploadPublicKey.mutateAsync(uploadedPublicKey)
      writeEncryptionKey(uploadedPrivateKey)
      onCompleted()
    } catch {
      setError(t('onboardingKeyInvalid'))
    }
  }

  return (
    <div className="flex-col-6 w-full">
      <div className="flex-col-1">
        <h1 className="typography-title-lg text-primary">{t('onboardingKeySetupTitle')}</h1>
        <p className="text-description">{t('onboardingKeySetupDescription')}</p>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 w-full">
        <button
          type="button"
          className={`flex-col-3 items-start p-4 rounded-2xl bg-surface-secondary text-left ${mode === 'create' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setMode('create')
            setError(undefined)
          }}
        >
          <Chip color="primary" size="sm">{t('recommended')}</Chip>
          <span className="typography-title-sm">{t('onboardingCreateKey')}</span>
          <span className="text-description">{t('onboardingCreateKeyDescription')}</span>
        </button>
        <button
          type="button"
          className={`flex-col-3 items-start p-4 rounded-2xl bg-surface-secondary text-left ${mode === 'upload' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setMode('upload')
            setError(undefined)
          }}
        >
          <span className="typography-title-sm">{t('onboardingUploadKeys')}</span>
          <span className="text-description">{t('onboardingUploadKeysDescription')}</span>
        </button>
      </div>

      {mode === 'create' && (
        <div className="flex-col-3">
          <Button
            type="button"
            color="primary"
            disabled={pair == null || isGenerating}
            isProcessing={isGenerating}
            className="self-start"
            onClick={() => {
              if (!pair) {
                return
              }
              downloadEncryptionKeyFile(pair.privateKey)
              setHasDownloaded(true)
            }}
          >
            {t('downloadPrivateKey')}
          </Button>
          <p className="text-description">{t('downloadKeyRequired')}</p>
        </div>
      )}

      {mode === 'upload' && (
        <div className="flex-col-4">
          <KeyFileField
            label={t('uploadPublicKey')}
            fileName={publicFileName}
            onFileText={(text, name) => applyUploadedFile('public', text, name)}
          />
          <KeyFileField
            label={t('uploadPrivateKey')}
            fileName={privateFileName}
            onFileText={(text, name) => applyUploadedFile('private', text, name)}
          />
        </div>
      )}

      {error && (
        <p className="text-warning">{error}</p>
      )}

      <Button
        type="button"
        color="primary"
        className="self-end"
        disabled={!canContinue}
        isProcessing={uploadPublicKey.isPending || isGenerating}
        onClick={() => void onContinue()}
      >
        {t('onboardingContinue')}
      </Button>
    </div>
  )
}
