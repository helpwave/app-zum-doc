import { useEffect, useState } from 'react'
import { Button } from '@helpwave/hightide'
import { PracticeExpandableSection } from '@/components/practice/practice-expandable-section'
import { downloadEncryptionKeyFile, readEncryptionKey } from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function EncryptionSection() {
  const t = useAdministrationTranslation()
  const [key, setKey] = useState<string | null>(null)

  useEffect(() => {
    setKey(readEncryptionKey())
  }, [])

  return (
    <PracticeExpandableSection title={t('encryptionSection')}>
      <Button
        type="button"
        color="primary"
        className="self-start"
        disabled={key == null}
        onClick={() => {
          if (!key) {
            return
          }
          downloadEncryptionKeyFile(key)
        }}
      >
        {t('downloadCertificate')}
      </Button>
    </PracticeExpandableSection>
  )
}
