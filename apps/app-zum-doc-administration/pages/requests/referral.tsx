import type { NextPage } from 'next'
import { RequestListView } from '@/components/requests/request-list-view'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'
import { requestStatusFiltersForKind } from '@/lib/navigation'

const ReferralRequestsPage: NextPage = () => {
  const t = useAdministrationTranslation()

  return (
    <RequestListView
      kind="referral"
      title={t('navReferrals')}
      description={t('referralsDescription')}
      includedStatuses={requestStatusFiltersForKind('referral')}
    />
  )
}

export default ReferralRequestsPage
