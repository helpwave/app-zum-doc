import type { NextPage } from 'next'
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
    <Page pageTitle={titleWrapper(t('requestDetail'))}>
      <QueryState
        isPending={requestQuery.isPending || !id}
        isError={requestQuery.isError}
        error={requestQuery.error}
        onRetry={() => void requestQuery.refetch()}
        loadingLabel={t('loadingRequest')}
      >
        {request && (
          <div className="flex-col-6 max-w-3xl">
            <BackIconButton
              className="self-start"
              onClick={() => void router.push(requestKindPath(request.kind))}
            />
            <div className="flex-col-2">
              <div className="flex-row-2 items-center">
                <RequestTypeChip kind={request.kind} />
                <RequestStatusChip status={request.status} />
              </div>
              <h1 className="typography-title-lg">{request.title}</h1>
              <p className="text-description">
                {t('patient')}: {patientProfileFullName(request.patient)}
              </p>
            </div>

            <dl className="flex-col-3">
              {isPracticeAppointment(request) && (
                <>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('date')}</dt>
                    <dd>{request.date}</dd>
                  </div>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('time')}</dt>
                    <dd>{request.time}</dd>
                  </div>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('emergency')}</dt>
                    <dd>{request.isEmergency ? t('yes') : t('no')}</dd>
                  </div>
                  {request.sickNote && (
                    <div className="flex-col-0">
                      <dt className="text-description">{t('sickNote')}</dt>
                      <dd>{request.sickNote}</dd>
                    </div>
                  )}
                  {request.note && (
                    <div className="flex-col-0">
                      <dt className="text-description">{t('note')}</dt>
                      <dd>{request.note}</dd>
                    </div>
                  )}
                </>
              )}
              {isPracticePrescription(request) && (
                <>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('shipByMail')}</dt>
                    <dd>{request.shipByMail ? t('yes') : t('no')}</dd>
                  </div>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('medications')}</dt>
                    <dd>
                      {request.medications.map((medication) => (
                        <div key={medication.id}>
                          {medication.name} ({medication.size})
                        </div>
                      ))}
                    </dd>
                  </div>
                  {request.note && (
                    <div className="flex-col-0">
                      <dt className="text-description">{t('note')}</dt>
                      <dd>{request.note}</dd>
                    </div>
                  )}
                </>
              )}
              {isPracticeReferral(request) && (
                <>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('specialization')}</dt>
                    <dd>{request.specialization}</dd>
                  </div>
                  <div className="flex-col-0">
                    <dt className="text-description">{t('reason')}</dt>
                    <dd>{request.reason}</dd>
                  </div>
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
