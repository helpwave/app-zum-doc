import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { AppLocale, PracticeDashboardMessage } from '@app-zum-doc/utils/api'
import { formatDashboardMessageTime } from '@/lib/datetime'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function DashboardMessageRow({
  message,
  locale,
}: {
  message: PracticeDashboardMessage,
  locale: AppLocale,
}) {
  const t = useAdministrationTranslation()

  return (
    <Link href={`/chat/${message.conversationId}`} className="dashboard-list-row">
      <span className="dashboard-list-time">
        {formatDashboardMessageTime(message.time, locale)}
      </span>
      <div className="dashboard-list-main">
        <span className="typography-title-sm truncate">{message.patientName}</span>
        <span className="text-description truncate">{message.preview}</span>
      </div>
      <span className="dashboard-row-action" aria-label={t('openDetails')}>
        <ChevronRight className="size-4" />
      </span>
    </Link>
  )
}
