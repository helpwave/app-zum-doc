import type { PracticeDashboardAppointment } from '@app-zum-doc/utils/api'
import { DashboardListRow } from '@/components/dashboard/list-row'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function DashboardAppointmentRow({
  appointment,
}: {
  appointment: PracticeDashboardAppointment,
}) {
  const t = useAdministrationTranslation()

  return (
    <DashboardListRow
      href={`/requests/${appointment.id}?kind=appointment`}
      time={appointment.time}
      name={appointment.patientName}
      insuranceLabel={appointment.insuranceLabel}
      detail={appointment.reason}
      actionLabel={t('openDetails')}
    />
  )
}
