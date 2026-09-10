import { IconButton } from '@helpwave/hightide'
import { ArrowLeft } from 'lucide-react'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function BackIconButton({
  onClick,
  className,
}: {
  onClick: () => void,
  className?: string,
}) {
  const t = useAdministrationTranslation()

  return (
    <IconButton
      tooltip={t('back')}
      size="sm"
      color="primary"
      coloringStyle="text"
      className={className}
      onClick={onClick}
    >
      <ArrowLeft className="size-5" />
    </IconButton>
  )
}
