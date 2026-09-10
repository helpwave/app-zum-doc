import type { AppLocale, PracticeDashboardMessage } from '@app-zum-doc/utils/api'
import { DashboardListRow } from '@/components/dashboard/list-row'
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
    <DashboardListRow
      href={`/chat/${message.conversationId}`}
      time={formatDashboardMessageTime(message.time, locale)}
      name={message.patientName}
      insuranceLabel={message.insuranceLabel}
      detail={message.preview}
      actionLabel={t('openDetails')}
    />
  )
}
