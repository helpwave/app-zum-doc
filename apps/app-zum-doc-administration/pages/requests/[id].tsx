import type { NextPage } from 'next'
import type { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@helpwave/hightide'
import {
  isPracticeAppointment,
  isPracticePrescription,
  isPracticeReferral,
  nextPatientRequestStatuses,
  patientProfileFullName,
  toAppLocale,
  type PatientRequestStatus
} from '@app-zum-doc/utils/api'
import {
  usePracticeRequest,
  useUpdatePatientRequestStatus
} from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { BackIconButton } from '@/components/layout/back-icon-button'
import { RequestStatusChip, RequestTypeChip } from '@/components/request-chips'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { statusActionLabel } from '@/lib/labels'
import { requestKindPath } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

function RequestAttribute({
  label,
  children,
}: {
  label: string,
  children: ReactNode,
}) {
  return (
    <>
      <dt className="text-description whitespace-nowrap">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  )
}

const RequestDetailPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const id = typeof router.query['id'] === 'string' ? router.query['id'] : ''
  const requestQuery = usePracticeRequest({
    parameters: id ? { id, locale } : undefined,
  })
  const updateStatus = useUpdatePatientRequestStatus()
  const request = requestQuery.data
  const nextStatuses = request
    ? nextPatientRequestStatuses(request.kind, request.status)
    : []

  const onStatus = (status: PatientRequestStatus) => {
    if (!request) {
      return
    }
    updateStatus.mutate({
      id: request.id,
      kind: request.kind,
      status,
      locale,
    })
  }

  return (
    <Page pageTitle={titleWrapper(request?.title ?? t('requestDetail'))}>
      <QueryState
        isPending={requestQuery.isPending || !id}
        isError={requestQuery.isError}
        error={requestQuery.error}
        onRetry={() => void requestQuery.refetch()}
        loadingLabel={t('loadingRequest')}
      >
        {request && (
          <div className="flex-col-6 max-w-3xl">
            <div className="flex-col-2 min-w-0">
              <header className="flex-row-3 items-center min-w-0">
                <BackIconButton
                  className="shrink-0"
                  onClick={() => void router.push(requestKindPath(request.kind))}
                />
                <h1 className="typography-title-lg min-w-0">
                  {request.title}
                </h1>
              </header>
              <div className="flex-row-2 items-center">
                <RequestTypeChip kind={request.kind} />
                <RequestStatusChip status={request.status} />
              </div>
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 items-start">
              <RequestAttribute label={t('patient')}>
                {patientProfileFullName(request.patient)}
              </RequestAttribute>
              {isPracticeAppointment(request) && (
                <>
                  <RequestAttribute label={t('date')}>{request.date}</RequestAttribute>
                  <RequestAttribute label={t('time')}>{request.time}</RequestAttribute>
                  <RequestAttribute label={t('emergency')}>
                    {request.isEmergency ? t('yes') : t('no')}
                  </RequestAttribute>
                  {request.sickNote && (
                    <RequestAttribute label={t('sickNote')}>
                      {request.sickNote}
                    </RequestAttribute>
                  )}
                  {request.note && (
                    <RequestAttribute label={t('note')}>{request.note}</RequestAttribute>
                  )}
                </>
              )}
              {isPracticePrescription(request) && (
                <>
                  <RequestAttribute label={t('shipByMail')}>
                    {request.shipByMail ? t('yes') : t('no')}
                  </RequestAttribute>
                  <RequestAttribute label={t('medications')}>
                    {request.medications.map((medication) => (
                      <div key={medication.id}>
                        {medication.name} ({medication.size})
                      </div>
                    ))}
                  </RequestAttribute>
                  {request.note && (
                    <RequestAttribute label={t('note')}>{request.note}</RequestAttribute>
                  )}
                </>
              )}
              {isPracticeReferral(request) && (
                <>
                  <RequestAttribute label={t('specialization')}>
                    {request.specialization}
                  </RequestAttribute>
                  <RequestAttribute label={t('reason')}>{request.reason}</RequestAttribute>
                </>
              )}
            </dl>

            {nextStatuses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    color={status === 'cancelled' ? 'negative' : 'primary'}
                    isProcessing={updateStatus.isPending}
                    onClick={() => onStatus(status)}
                  >
                    {statusActionLabel(status, t)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </QueryState>
    </Page>
  )
}

export default RequestDetailPage
