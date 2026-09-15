import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  ExpansionIcon,
  FilterFunctions,
  FilterList,
  IconButton,
  SearchBar,
  SortingList,
  Table,
  TableCell,
  TableColumn,
  overscanRowsForBuffer,
  type FilterListItem,
  type IdentifierFilterValue,
  type SortingListItem
} from '@helpwave/hightide'
import { Info, LoaderCircle, Pencil } from 'lucide-react'
import {
  findInsuranceCompany,
  formatPatientDateLong,
  patientProfileFullName,
  type AppLocale,
  type PracticePatient
} from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

const PAGE_SIZE = 25
const TABLE_ROW_ESTIMATE_PX = 56
const TABLE_OVERSCAN_ROWS = overscanRowsForBuffer(800, TABLE_ROW_ESTIMATE_PX)
const LOAD_MORE_DELAY_MS = 280

type PatientColumnSort = {
  id: string,
  desc: boolean,
}

function patientFilterValue(
  patient: PracticePatient,
  filterId: string
): unknown {
  if (filterId === 'name') {
    return patientProfileFullName(patient)
  }
  if (filterId === 'dateOfBirth') {
    return patient.dateOfBirth
  }
  if (filterId === 'lastVisit') {
    return patient.lastVisit
  }
  if (filterId === 'blocked') {
    return patient.blocked
  }
  if (filterId === 'insuranceType') {
    return findInsuranceCompany(patient.insurance.insuranceProviderId)?.type
  }
  return undefined
}

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
    return fn(
      patientFilterValue(patient, filter.id),
      filter.value.operator,
      filter.value.parameter
    )
  }))
}

function comparePatientSortValue(
  left: PracticePatient,
  right: PracticePatient,
  sortId: string,
  locale: AppLocale
): number {
  if (sortId === 'name') {
    return patientProfileFullName(left).localeCompare(
      patientProfileFullName(right),
      locale,
      { sensitivity: 'base' }
    )
  }
  if (sortId === 'dateOfBirth' || sortId === 'lastVisit') {
    return left[sortId].getTime() - right[sortId].getTime()
  }
  return 0
}

function sortPatients(
  patients: PracticePatient[],
  sorting: PatientColumnSort[],
  locale: AppLocale
): PracticePatient[] {
  if (sorting.length === 0) {
    return patients
  }
  return [...patients].sort((left, right) => {
    for (const sort of sorting) {
      const comparison = comparePatientSortValue(left, right, sort.id, locale)
      if (comparison !== 0) {
        return sort.desc ? -comparison : comparison
      }
    }
    return 0
  })
}

export function PatientTable({
  patients,
  locale,
  selectedId,
  onSelect,
  actions,
}: {
  patients: PracticePatient[],
  locale: AppLocale,
  selectedId: string | undefined,
  onSelect: (patientId: string) => void,
  actions?: ReactNode,
}) {
  const t = useAdministrationTranslation()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<IdentifierFilterValue[]>([])
  const [sorting, setSorting] = useState<PatientColumnSort[]>([
    { id: 'name', desc: false },
  ])
  const [isShowFilters, setIsShowFilters] = useState(true)
  const [isShowSorting, setIsShowSorting] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const availableFilters: FilterListItem[] = useMemo(() => [
    {
      id: 'name',
      label: t('patientColumnName'),
      dataType: 'text',
      tags: [],
    },
    {
      id: 'dateOfBirth',
      label: t('patientColumnDateOfBirth'),
      dataType: 'date',
      tags: [],
    },
    {
      id: 'lastVisit',
      label: t('patientColumnLastVisit'),
      dataType: 'date',
      tags: [],
    },
    {
      id: 'insuranceType',
      label: t('insuranceType'),
      dataType: 'singleTag',
      tags: [
        { tag: 'public', label: t('insurancePublic') },
        { tag: 'private', label: t('insurancePrivate') },
      ],
    },
    {
      id: 'blocked',
      label: t('patientBlocked'),
      dataType: 'boolean',
      tags: [],
    },
  ], [t])

  const availableSortItems: SortingListItem[] = useMemo(() => [
    { id: 'name', label: t('patientColumnName'), dataType: 'text' },
    { id: 'dateOfBirth', label: t('patientColumnDateOfBirth'), dataType: 'date' },
    { id: 'lastVisit', label: t('patientColumnLastVisit'), dataType: 'date' },
  ], [t])

  const matchedPatients = useMemo(() => {
    const query = search.trim().toLowerCase()
    const searched = query.length === 0
      ? patients
      : patients.filter((patient) => (
        patientProfileFullName(patient).toLowerCase().includes(query)
      ))
    return sortPatients(applyPatientFilters(searched, filters), sorting, locale)
  }, [filters, locale, patients, search, sorting])

  const accumulationResetKey = JSON.stringify({ search, filters, sorting })

  useEffect(() => {
    setPageIndex(0)
    setIsFetchingMore(false)
  }, [accumulationResetKey])

  const visiblePatients = matchedPatients.slice(0, (pageIndex + 1) * PAGE_SIZE)
  const hasMore = visiblePatients.length < matchedPatients.length

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingMore) {
      return
    }
    setIsFetchingMore(true)
    window.setTimeout(() => {
      setPageIndex((current) => current + 1)
      setIsFetchingMore(false)
    }, LOAD_MORE_DELAY_MS)
  }, [hasMore, isFetchingMore])

  const handleReachBottom = useCallback(() => {
    loadMore()
  }, [loadMore])

  return (
    <div className="flex-col-3 min-w-0 flex-1">
      <div className="flex-row-3 items-center justify-between gap-y-2 flex-wrap">
        <SearchBar
          value={search}
          onValueChange={setSearch}
          onSearch={setSearch}
          placeholder={t('searchPatients')}
          containerProps={{ className: 'min-w-0 flex-1 max-w-80' }}
        />
        <div className="flex-row-2 flex-wrap items-center">
          <Button
            color="neutral"
            coloringStyle="tonal"
            size="sm"
            className="font-semibold"
            onClick={() => setIsShowFilters((current) => !current)}
          >
            {`${t('filter')} (${filters.length})`}
            <ExpansionIcon isExpanded={isShowFilters} />
          </Button>
          <Button
            color="neutral"
            coloringStyle="tonal"
            size="sm"
            className="font-semibold"
            onClick={() => setIsShowSorting((current) => !current)}
          >
            {`${t('sorting')} (${sorting.length})`}
            <ExpansionIcon isExpanded={isShowSorting} />
          </Button>
          {actions}
        </div>
      </div>

      {isShowFilters && (
        <FilterList
          value={filters}
          onValueChange={setFilters}
          availableItems={availableFilters}
        />
      )}
      {isShowSorting && (
        <SortingList
          sorting={sorting}
          onSortingChange={setSorting}
          availableItems={availableSortItems}
        />
      )}

      {matchedPatients.length === 0 ? (
        <p className="text-description">{t('noPatients')}</p>
      ) : (
        <>
          <Table
            className="patients-table"
            displayProps={{
              virtualized: {
                estimateRowHeight: TABLE_ROW_ESTIMATE_PX,
                overscan: TABLE_OVERSCAN_ROWS,
                scroll: 'container',
                onReachBottom: handleReachBottom,
              },
            }}
            table={{
              data: visiblePatients,
              getRowId: (row) => row.id,
              isUsingFillerRows: false,
              enableSorting: false,
              enableColumnFilters: false,
              enableMultiSort: true,
              manualPagination: true,
              manualSorting: true,
              manualFiltering: true,
              pageCount: 1,
              initialState: {
                pagination: { pageSize: PAGE_SIZE },
              },
              state: {
                pagination: {
                  pageIndex: 0,
                  pageSize: Math.max(visiblePatients.length, 1),
                },
                sorting,
              },
              onRowClick: (row) => onSelect(row.original.id),
              meta: {
                bodyRowClassName: (patient) => (
                  patient.id === selectedId ? 'patient-row-active' : ''
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
              minSize={200}
              size={220}
              cell={({ row }) => (
                <TableCell className="whitespace-nowrap">
                  {formatPatientDateLong(row.original.dateOfBirth, locale)}
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
              minSize={210}
              size={230}
              cell={({ row }) => (
                <TableCell className="whitespace-nowrap">
                  {formatPatientDateLong(row.original.lastVisit, locale)}
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
                    onSelect(row.original.id)
                  }}
                >
                  <Pencil className="size-4" />
                </IconButton>
              )}
            />
          </Table>
          {isFetchingMore && (
            <div className="flex-row-2 items-center justify-center py-3 text-description">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              <span>{t('loadingMorePatients')}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
