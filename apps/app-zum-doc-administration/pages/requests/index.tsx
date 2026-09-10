import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, SearchBar } from '@helpwave/hightide'
import {
  PatientRequestStatusUtils,
  type PatientRequestStatus,
  toAppLocale
} from '@app-zum-doc/utils/api'
import { usePracticeRequests } from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { RequestListRow } from '@/components/request-list-row'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { requestStatusLabel, requestTypeLabel } from '@/lib/labels'
import { parseRequestKind, practiceOfficeId } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

const RequestsPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const kind = parseRequestKind(router.query['kind'])
  const [status, setStatus] = useState<PatientRequestStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const requestsQuery = usePracticeRequests({
    parameters: {
      officeId: practiceOfficeId,
      locale,
      kind,
      status,
    },
  })

  const requests = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = requestsQuery.data ?? []
    if (!query) {
      return items
    }
    return items.filter((request) => {
      const haystack = `${request.title} ${request.patient.firstName} ${request.patient.lastName}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [requestsQuery.data, search])

  const title = kind ? requestTypeLabel(kind, t) : t('inboxTitle')

  return (
    <Page pageTitle={titleWrapper(title)}>
      <div className="flex-col-6">
        <div className="flex-col-1">
          <h1 className="typography-title-lg text-primary">{title}</h1>
          <p className="text-description">{t('inboxDescription')}</p>
        </div>

        <SearchBar
          value={search}
          onValueChange={setSearch}
          onSearch={setSearch}
          placeholder={t('searchRequests')}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            color={status === undefined ? 'primary' : 'neutral'}
            coloringStyle={status === undefined ? 'solid' : 'tonal'}
            onClick={() => setStatus(undefined)}
          >
            {t('filterAll')}
          </Button>
          {PatientRequestStatusUtils.array.map((item) => (
            <Button
              key={item}
              size="sm"
              color={status === item ? 'primary' : 'neutral'}
              coloringStyle={status === item ? 'solid' : 'tonal'}
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
                <RequestListRow key={request.id} request={request} />
              ))}
            </div>
          )}
        </QueryState>
      </div>
    </Page>
  )
}

export default RequestsPage
