import type { ReactNode } from 'react'
import { Button, Dialog } from '@helpwave/hightide'
import { MessageSquare } from 'lucide-react'
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
  usePracticePatients,
  usePracticeRequest,
  useUpdatePatientRequestStatus
} from '@app-zum-doc/utils/hooks'
import { QueryState } from '@/components/layout/Page'
import { NavigationListTile } from '@/components/layout/navigation-list-tile'
import { PatientDetailPanel } from '@/components/patients/patient-detail-panel'
import { RequestStatusChip, RequestTypeChip } from '@/components/request-chips'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { statusActionLabel } from '@/lib/labels'

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
      <dd className="min-w-0 text-left">{children}</dd>
    </>
  )
}

export function RequestDetailDialog({
  isOpen,
  requestId,
  onClose,
}: {
  isOpen: boolean,
  requestId: string | null,
  onClose: () => void,
}) {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const requestQuery = usePracticeRequest({
    parameters: requestId ? { id: requestId, locale } : undefined,
    enabled: requestId != null,
  })
  const patientsQuery = usePracticePatients({ enabled: requestId != null })
  const updateStatus = useUpdatePatientRequestStatus()
  const request = requestQuery.data
  const patient = patientsQuery.data?.find((item) => item.id === request?.patient.id)
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
    <Dialog
      isOpen={isOpen}
      isModal
      className="w-full max-w-5xl"
      titleElement={request?.title ?? t('requestDetail')}
      description=""
      onClose={onClose}
    >
      <QueryState
        isPending={requestQuery.isPending || patientsQuery.isPending}
        isError={requestQuery.isError}
        error={requestQuery.error}
        onRetry={() => void requestQuery.refetch()}
        loadingLabel={t('loadingRequest')}
      >
        {request && (
          <div className="flex-col-6">
            <div className="flex flex-col gap-6 items-start tablet:flex-row">
              <div className="flex-col-6 min-w-0 flex-1 w-full justify-between self-stretch">
                <div className="flex-col-4">
                  <div className="flex-row-2 items-center">
                    <RequestTypeChip kind={request.kind} />
                    <RequestStatusChip status={request.status} />
                  </div>

                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-8 gap-y-3 items-start">
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
                </div>

                <div className="flex-col-4">
                  <NavigationListTile
                    href={`/chat/${request.patient.id}?requestId=${request.id}`}
                    title={t('openChat')}
                    description={patientProfileFullName(request.patient)}
                    leading={<MessageSquare className="size-5 shrink-0" />}
                    onClick={onClose}
                  />

                  {nextStatuses.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
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
              </div>

              {patient && (
                <PatientDetailPanel
                  patient={patient}
                  locale={locale}
                />
              )}
            </div>
          </div>
        )}
      </QueryState>
    </Dialog>
  )
}
