import { Button } from '@helpwave/hightide'
import { PracticeExpandableSection } from '@/components/practice/practice-expandable-section'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

const encryptionKeyStorageKey = 'app-zum-doc.encryption-key'
const defaultEncryptionKey = 'app-zum-doc-local-encryption-key'

function currentEncryptionKey(): string {
  if (typeof window === 'undefined') {
    return defaultEncryptionKey
  }
  return window.localStorage.getItem(encryptionKeyStorageKey) ?? defaultEncryptionKey
}

function downloadCertificate() {
  const blob = new Blob([currentEncryptionKey()], { type: 'application/octet-stream' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = 'certificate.txt'
  link.click()
  URL.revokeObjectURL(href)
}

export function EncryptionSection() {
  const t = useAdministrationTranslation()

  return (
    <PracticeExpandableSection title={t('encryptionSection')}>
      <Button
        type="button"
        color="primary"
        className="self-start"
        onClick={downloadCertificate}
      >
        {t('downloadCertificate')}
      </Button>
    </PracticeExpandableSection>
  )
}
