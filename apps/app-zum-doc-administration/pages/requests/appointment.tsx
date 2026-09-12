import type { NextPage } from 'next'
import { RequestListView } from '@/components/requests/request-list-view'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'
import { requestStatusFiltersForKind } from '@/lib/navigation'

const AppointmentRequestsPage: NextPage = () => {
  const t = useAdministrationTranslation()

  return (
    <RequestListView
      kind="appointment"
      title={t('navAppointments')}
      description={t('appointmentsDescription')}
      includedStatuses={requestStatusFiltersForKind('appointment')}
    />
  )
}

export default AppointmentRequestsPage
