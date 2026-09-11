import type { ReactNode } from 'react'
import { Button, Expandable } from '@helpwave/hightide'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function PracticeExpandableSection({
  title,
  children,
  onSave,
  canSave = true,
  isSaving = false,
  saved = false,
}: {
  title: string,
  children: ReactNode,
  onSave?: () => void,
  canSave?: boolean,
  isSaving?: boolean,
  saved?: boolean,
}) {
  const t = useAdministrationTranslation()

  return (
    <Expandable
      className="w-full"
      isInitialExpanded
      trigger={<span className="typography-label-lg">{title}</span>}
      contentProps={{ className: 'h-auto overflow-visible' }}
      contentExpandedClassName="!max-h-none"
    >
      <div className="flex-col-4 w-full">
        {children}
        {onSave && (
          <div className="flex-row-3 items-center justify-end w-full">
            <Button
              color="primary"
              disabled={!canSave}
              isProcessing={isSaving}
              onClick={onSave}
            >
              {t('save')}
            </Button>
            {saved && <span className="text-description">{t('saved')}</span>}
          </div>
        )}
      </div>
    </Expandable>
  )
}
