import { useState } from 'react'
import { Button, Dialog } from '@helpwave/hightide'
import { PracticeExpandableSection } from '@/components/practice/practice-expandable-section'
import { SettingsField } from '@/components/practice/settings-field'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

const encryptionKeyStorageKey = 'app-zum-doc.encryption-key'
const defaultEncryptionKey = 'app-zum-doc-local-encryption-key'

function currentEncryptionKey(): string {
  if (typeof window === 'undefined') {
    return defaultEncryptionKey
  }
  return window.localStorage.getItem(encryptionKeyStorageKey) ?? defaultEncryptionKey
}

function downloadCurrentEncryptionKey() {
  const blob = new Blob([currentEncryptionKey()], { type: 'application/octet-stream' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = 'encryption-key.txt'
  link.click()
  URL.revokeObjectURL(href)
}

export function EncryptionSection() {
  const t = useAdministrationTranslation()
  const [isReplaceOpen, setIsReplaceOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  const closeReplaceDialog = () => {
    setIsReplaceOpen(false)
    setSelectedFile(null)
    setFileInputKey((current) => current + 1)
  }

  const replaceKey = async () => {
    if (!selectedFile) {
      return
    }
    const contents = await selectedFile.text()
    window.localStorage.setItem(encryptionKeyStorageKey, contents)
    closeReplaceDialog()
  }

  return (
    <>
      <PracticeExpandableSection title={t('encryptionSection')}>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            color="primary"
            onClick={downloadCurrentEncryptionKey}
          >
            {t('downloadEncryptionKey')}
          </Button>
          <Button
            type="button"
            color="neutral"
            coloringStyle="outline"
            onClick={() => setIsReplaceOpen(true)}
          >
            {t('replaceEncryptionKey')}
          </Button>
        </div>
      </PracticeExpandableSection>

      <Dialog
        isOpen={isReplaceOpen}
        isModal
        className="w-full max-w-lg"
        titleElement={t('replaceEncryptionKeyTitle')}
        description={t('replaceEncryptionKeyWarning')}
        onClose={closeReplaceDialog}
      >
        <div className="flex-col-4 w-full">
          <SettingsField label={t('encryptionKeyFile')}>
            <input
              key={fileInputKey}
              type="file"
              className="w-full min-w-0"
              onChange={(event) => {
                setSelectedFile(event.currentTarget.files?.[0] ?? null)
              }}
            />
          </SettingsField>
          <div className="flex-row-3 justify-end w-full">
            <Button
              type="button"
              color="neutral"
              coloringStyle="outline"
              onClick={closeReplaceDialog}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              color="primary"
              disabled={selectedFile == null}
              onClick={() => {
                void replaceKey()
              }}
            >
              {t('replaceKey')}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
