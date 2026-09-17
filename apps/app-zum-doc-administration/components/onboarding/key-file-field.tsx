import { useRef } from 'react'
import { Button } from '@helpwave/hightide'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function KeyFileField({
  label,
  fileName,
  accept,
  error,
  onFileText,
}: {
  label: string,
  fileName?: string,
  accept?: string,
  error?: string,
  onFileText: (text: string, name: string) => void,
}) {
  const t = useAdministrationTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex-col-2 w-full min-w-0">
      <span className="typography-label-md">{label}</span>
      <div className="flex-row-3 items-center min-w-0">
        <Button
          type="button"
          color="primary"
          coloringStyle="tonal"
          className="!min-w-0"
          onClick={() => inputRef.current?.click()}
        >
          {t('selectFile')}
        </Button>
        <span className="text-description truncate">
          {fileName ?? t('noFileSelected')}
        </span>
      </div>
      {error && (
        <p className="text-warning">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) {
            return
          }
          void file.text().then((text) => {
            onFileText(text, file.name)
          })
          event.target.value = ''
        }}
      />
    </div>
  )
}
