import type { NextPage } from 'next'
import { RequestListView } from '@/components/requests/request-list-view'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'
import { requestStatusFiltersForKind } from '@/lib/navigation'

const PrescriptionRequestsPage: NextPage = () => {
  const t = useAdministrationTranslation()

  return (
    <RequestListView
      kind="prescription"
      title={t('navPrescriptions')}
      description={t('prescriptionsDescription')}
      includedStatuses={requestStatusFiltersForKind('prescription')}
    />
  )
}

export default PrescriptionRequestsPage
