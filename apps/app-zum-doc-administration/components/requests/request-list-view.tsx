import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button, Card, SearchBar } from '@helpwave/hightide'
import {
  type PatientRequestStatus,
  type PatientRequestType,
  toAppLocale
} from '@app-zum-doc/utils/api'
import { usePracticeRequests } from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { RequestDetailDialog } from '@/components/requests/request-detail-dialog'
import { RequestListRow } from '@/components/request-list-row'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { requestStatusLabel, requestTypeLabel } from '@/lib/labels'
import { practiceOfficeId, requestKindPath } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

export function RequestListView({
  kind,
  title,
  description,
  includedStatuses,
  showKindCounts = false,
}: {
  kind?: PatientRequestType,
  title: string,
  description?: string,
  includedStatuses: PatientRequestStatus[],
  showKindCounts?: boolean,
}) {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const [status, setStatus] = useState<PatientRequestStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const requestsQuery = usePracticeRequests({
    parameters: {
      officeId: practiceOfficeId,
      locale,
      kind,
    },
  })

  const requests = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (requestsQuery.data ?? []).filter((request) => {
      if (status && request.status !== status) {
        return false
      }
      if (!query) {
        return true
      }
      const haystack = `${request.title} ${request.patient.firstName} ${request.patient.lastName}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [requestsQuery.data, search, status])

  const kindCounts = useMemo(() => {
    const items = requestsQuery.data ?? []
    return {
      appointment: items.filter((request) => request.kind === 'appointment').length,
      prescription: items.filter((request) => request.kind === 'prescription').length,
      referral: items.filter((request) => request.kind === 'referral').length,
    }
  }, [requestsQuery.data])

  const activeStatus = status && includedStatuses.includes(status) ? status : undefined

  return (
    <Page pageTitle={titleWrapper(title)}>
      <div className="flex-col-6 w-full">
        <div className="flex-col-1">
          <h1 className="typography-title-lg text-primary">{title}</h1>
          {description && <p className="text-description">{description}</p>}
        </div>

        {showKindCounts && (
          <div className="grid grid-cols-1 desktop:grid-cols-3 gap-4 w-full">
            <Link href={requestKindPath('appointment')} className="min-w-0">
              <Card title={requestTypeLabel('appointment', t)}>
                <span className="text-4xl font-semibold leading-none">
                  {kindCounts.appointment}
                </span>
              </Card>
            </Link>
            <Link href={requestKindPath('prescription')} className="min-w-0">
              <Card title={requestTypeLabel('prescription', t)}>
                <span className="text-4xl font-semibold leading-none">
                  {kindCounts.prescription}
                </span>
              </Card>
            </Link>
            <Link href={requestKindPath('referral')} className="min-w-0">
              <Card title={requestTypeLabel('referral', t)}>
                <span className="text-4xl font-semibold leading-none">
                  {kindCounts.referral}
                </span>
              </Card>
            </Link>
          </div>
        )}

        <SearchBar
          value={search}
          onValueChange={setSearch}
          onSearch={setSearch}
          placeholder={t('searchRequests')}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            color={activeStatus === undefined ? 'primary' : 'neutral'}
            coloringStyle={activeStatus === undefined ? 'solid' : 'tonal'}
            onClick={() => setStatus(undefined)}
          >
            {t('filterAll')}
          </Button>
          {includedStatuses.map((item) => (
            <Button
              key={item}
              size="sm"
              color={activeStatus === item ? 'primary' : 'neutral'}
              coloringStyle={activeStatus === item ? 'solid' : 'tonal'}
              onClick={() => setStatus(item)}
            >
              {requestStatusLabel(item, t)}
            </Button>
          ))}
        </div>

        <QueryState
          isPending={requestsQuery.isPending}
          isError={requestsQuery.isError}
          error={requestsQuery.error}
          onRetry={() => void requestsQuery.refetch()}
          loadingLabel={t('loadingRequests')}
        >
          {requests.length === 0 ? (
            <p className="text-description">{t('noRequests')}</p>
          ) : (
            <div className="flex-col-3 w-full">
              {requests.map((request) => (
                <RequestListRow
                  key={request.id}
                  request={request}
                  onSelect={(requestId) => {
                    setSelectedRequestId(requestId)
                    setIsOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </QueryState>
      </div>
      <RequestDetailDialog
        isOpen={isOpen}
        requestId={selectedRequestId}
        onClose={() => setIsOpen(false)}
      />
    </Page>
  )
}
