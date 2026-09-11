import type { PracticeDashboardAppointment } from '@app-zum-doc/utils/api'
import { DashboardListRow } from '@/components/dashboard/list-row'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function DashboardAppointmentRow({
  appointment,
  onSelect,
}: {
  appointment: PracticeDashboardAppointment,
  onSelect: (requestId: string) => void,
}) {
  const t = useAdministrationTranslation()

  return (
    <DashboardListRow
      time={appointment.time}
      name={appointment.patientName}
      insuranceLabel={appointment.insuranceLabel}
      detail={appointment.reason}
      actionLabel={t('openDetails')}
      onClick={() => onSelect(appointment.id)}
    />
  )
}
