import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import {
  Button,
  FilterFunctions,
  FilterList,
  IconButton,
  TableCell,
  TableColumn,
  TableWithSelection,
  type IdentifierFilterValue
} from '@helpwave/hightide'
import { Info, Pencil, Plus } from 'lucide-react'
import {
  formatPatientDayMonth,
  patientProfileFullName,
  toAppLocale,
  type PracticePatient
} from '@app-zum-doc/utils/api'
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
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

function applyPatientFilters(
  patients: PracticePatient[],
  filters: IdentifierFilterValue[]
): PracticePatient[] {
  if (filters.length === 0) {
    return patients
  }
  return patients.filter((patient) => filters.every((filter) => {
    const fn = FilterFunctions[filter.value.dataType]
    if (!fn) {
      return true
    }
    if (filter.id === 'name') {
      return fn(
        patientProfileFullName(patient),
        filter.value.operator,
        filter.value.parameter
      )
    }
    if (filter.id === 'dateOfBirth') {
      return fn(
        patient.dateOfBirth,
        filter.value.operator,
        filter.value.parameter
      )
    }
    if (filter.id === 'lastVisit') {
      return fn(
        patient.lastVisit,
        filter.value.operator,
        filter.value.parameter
      )
    }
    return true
  }))
}

const PatientsPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const patientsQuery = usePracticePatients()
  const createPatient = useCreatePracticePatient()
  const deletePatient = useDeletePracticePatient()
  const setBlocked = useSetPracticePatientBlocked()
  const [filters, setFilters] = useState<IdentifierFilterValue[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const patients = useMemo(
    () => applyPatientFilters(patientsQuery.data ?? [], filters),
    [patientsQuery.data, filters]
  )
  const selectedPatient = patientsQuery.data?.find((item) => item.id === selectedId)
    ?? patientsQuery.data?.[0]
  const activePatientId = selectedPatient?.id

  const filterItems = useMemo(() => [
    { id: 'name', label: t('patientColumnName'), dataType: 'text' as const, tags: [] },
    { id: 'dateOfBirth', label: t('patientColumnDateOfBirth'), dataType: 'date' as const, tags: [] },
    { id: 'lastVisit', label: t('patientColumnLastVisit'), dataType: 'date' as const, tags: [] },
  ], [t])

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
          <div className="patients-layout">
            <div className="flex-col-3 min-w-0 flex-1">
              <div className="flex-row-3 items-start justify-between gap-y-2 flex-wrap">
                <FilterList
                  value={filters}
                  onValueChange={setFilters}
                  availableItems={filterItems}
                />
                <Button
                  color="primary"
                  size="sm"
                  className="!min-w-0"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  {t('addPatient')}
                </Button>
              </div>

              {patients.length === 0 ? (
                <p className="text-description">{t('noPatients')}</p>
              ) : (
                <TableWithSelection
                  className="patients-table"
                  table={{
                    data: patients,
                    getRowId: (row) => row.id,
                    rowSelection,
                    onRowSelectionChange: setRowSelection,
                    disableClickRowClickSelection: true,
                    isUsingFillerRows: false,
                    enableSorting: false,
                    enableColumnFilters: false,
                    initialState: {
                      pagination: { pageSize: 100 },
                    },
                    state: {
                      pagination: { pageIndex: 0, pageSize: 100 },
                    },
                    onRowClick: (row) => setSelectedId(row.original.id),
                    meta: {
                      bodyRowClassName: (patient) => (
                        patient.id === activePatientId ? 'patient-row-active' : ''
                      ),
                    },
                  }}
                  paginationOptions={{ showPagination: false }}
                >
                  <TableColumn<PracticePatient>
                    id="name"
                    header={t('patientColumnName')}
                    accessorFn={(row) => patientProfileFullName(row)}
                    minSize={220}
                    size={280}
                    cell={({ row }) => (
                      <div className="flex-col-0 min-w-0">
                        <span className="font-semibold truncate">
                          {patientProfileFullName(row.original)}
                        </span>
                        <span className="text-description text-sm truncate">
                          {row.original.insurance.insuranceNumber}
                        </span>
                      </div>
                    )}
                  />
                  <TableColumn<PracticePatient>
                    id="dateOfBirth"
                    header={t('patientColumnDateOfBirth')}
                    accessorKey="dateOfBirth"
                    minSize={150}
                    size={180}
                    cell={({ row }) => (
                      <TableCell className="whitespace-nowrap">
                        {formatPatientDayMonth(row.original.dateOfBirth, locale)}
                      </TableCell>
                    )}
                  />
                  <TableColumn<PracticePatient>
                    id="lastVisit"
                    header={() => (
                      <span className="flex-row-1 items-center">
                        {t('patientColumnLastVisit')}
                        <IconButton
                          tooltip={t('lastVisitHint')}
                          size="xs"
                          coloringStyle="text"
                          color="neutral"
                        >
                          <Info className="size-3.5" />
                        </IconButton>
                      </span>
                    )}
                    accessorKey="lastVisit"
                    minSize={160}
                    size={190}
                    cell={({ row }) => (
                      <TableCell className="whitespace-nowrap">
                        {formatPatientDayMonth(row.original.lastVisit, locale)}
                      </TableCell>
                    )}
                  />
                  <TableColumn<PracticePatient>
                    id="actions"
                    header={t('patientColumnActions')}
                    enableSorting={false}
                    minSize={80}
                    size={90}
                    maxSize={90}
                    cell={({ row }) => (
                      <IconButton
                        tooltip={t('editPatient')}
                        size="sm"
                        coloringStyle="text"
                        color="neutral"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedId(row.original.id)
                        }}
                      >
                        <Pencil className="size-4" />
                      </IconButton>
                    )}
                  />
                </TableWithSelection>
              )}
            </div>

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
