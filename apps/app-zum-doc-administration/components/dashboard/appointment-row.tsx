import Link from 'next/link'
import { Chip } from '@helpwave/hightide'
import { ChevronRight } from 'lucide-react'
import type { PracticeDashboardAppointment } from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function DashboardAppointmentRow({
  appointment,
}: {
  appointment: PracticeDashboardAppointment,
}) {
  const t = useAdministrationTranslation()

  return (
    <Link
      href={`/requests/${appointment.id}?kind=appointment`}
      className="dashboard-list-row"
    >
      <span className="dashboard-list-time">{appointment.time}</span>
      <div className="dashboard-list-main">
        <span className="typography-title-sm truncate">{appointment.patientName}</span>
        <Chip size="xs" color="neutral" coloringStyle="tonal">
          {appointment.insuranceLabel}
        </Chip>
      </div>
      <span className="hidden min-w-0 max-w-40 truncate text-description text-sm tablet:block">
        {appointment.reason}
      </span>
      <span className="dashboard-row-action" aria-label={t('openDetails')}>
        <ChevronRight className="size-4" />
      </span>
    </Link>
  )
}
