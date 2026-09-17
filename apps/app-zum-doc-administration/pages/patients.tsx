import type { NextPage } from 'next'
import { useState } from 'react'
import { Button } from '@helpwave/hightide'
import { Plus } from 'lucide-react'
import { toAppLocale } from '@app-zum-doc/utils/api'
import {
  useCreatePracticePatient,
  useDeletePracticePatient,
  usePracticePatients,
  useSetPracticePatientBlocked
} from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { CreatePatientDialog } from '@/components/patients/create-patient-dialog'
import {
  DeletePatientDialog,
  PatientDetailPanel
} from '@/components/patients/patient-detail-panel'
import { PatientTable } from '@/components/patients/patient-table'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

const PatientsPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const patientsQuery = usePracticePatients()
  const createPatient = useCreatePracticePatient()
  const deletePatient = useDeletePracticePatient()
  const setBlocked = useSetPracticePatientBlocked()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const patients = patientsQuery.data ?? []
  const selectedPatient = patients.find((item) => item.id === selectedId)
    ?? patients[0]
  const activePatientId = selectedPatient?.id

  return (
    <Page pageTitle={titleWrapper(t('patientsTitle'))}>
      <div className="flex-col-6 w-full min-w-0">
        <h1 className="typography-title-lg text-primary">{t('patientsTitle')}</h1>

        <QueryState
          isPending={patientsQuery.isPending}
          isError={patientsQuery.isError}
          error={patientsQuery.error}
          onRetry={() => void patientsQuery.refetch()}
          loadingLabel={t('loadingPatients')}
        >
          <div className="flex flex-col gap-6 w-full min-w-0 tablet:flex-row tablet:items-start">
            <PatientTable
              patients={patients}
              locale={locale}
              selectedId={activePatientId}
              onSelect={setSelectedId}
              actions={(
                <Button
                  color="primary"
                  size="sm"
                  className="!min-w-0"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  {t('addPatient')}
                </Button>
              )}
            />

            {selectedPatient && (
              <PatientDetailPanel
                patient={selectedPatient}
                locale={locale}
                isDeleting={deletePatient.isPending}
                isBlocking={setBlocked.isPending}
                onDelete={() => setIsDeleteOpen(true)}
                onToggleBlocked={() => {
                  setBlocked.mutate({
                    profileId: selectedPatient.id,
                    blocked: !selectedPatient.blocked,
                  })
                }}
              />
            )}
          </div>
        </QueryState>
      </div>

      <CreatePatientDialog
        isOpen={isCreateOpen}
        isCreating={createPatient.isPending}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(input) => {
          createPatient.mutate(input, {
            onSuccess: (patient) => {
              setSelectedId(patient.id)
              setIsCreateOpen(false)
            },
          })
        }}
      />
      <DeletePatientDialog
        patient={selectedPatient}
        isOpen={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (!selectedPatient) {
            return
          }
          deletePatient.mutate(selectedPatient.id, {
            onSuccess: () => {
              setSelectedId(undefined)
              setIsDeleteOpen(false)
            },
          })
        }}
      />
    </Page>
  )
}

export default PatientsPage
