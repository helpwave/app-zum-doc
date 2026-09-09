import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import { Chip, SearchBar } from '@helpwave/hightide'
import {
  formatInsuranceChipLabel,
  formatPatientDateOfBirth,
  patientProfileFullName,
  toAppLocale
} from '@app-zum-doc/utils/api'
import { usePracticePatients } from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

const PatientsPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const [search, setSearch] = useState('')
  const patientsQuery = usePracticePatients()

  const patients = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = patientsQuery.data ?? []
    if (!query) {
      return items
    }
    return items.filter((patient) => {
      const haystack = `${patient.firstName} ${patient.lastName} ${patient.email}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [patientsQuery.data, search])

  return (
    <Page pageTitle={titleWrapper(t('patientsTitle'))}>
      <div className="flex-col-6">
        <div className="flex-col-1">
          <h1 className="typography-title-lg text-primary">{t('patientsTitle')}</h1>
          <p className="text-description">{t('patientsDescription')}</p>
        </div>

        <SearchBar
          value={search}
          onValueChange={setSearch}
          onSearch={setSearch}
          placeholder={t('searchPatients')}
        />

        <QueryState
          isPending={patientsQuery.isPending}
          isError={patientsQuery.isError}
          error={patientsQuery.error}
          onRetry={() => void patientsQuery.refetch()}
          loadingLabel={t('loadingPatients')}
        >
          {patients.length === 0 ? (
            <p className="text-description">{t('noPatients')}</p>
          ) : (
            <div className="flex-col-3">
              {patients.map((patient) => (
                <div key={patient.id} className="dashboard-list-row">
                  <div className="dashboard-list-main">
                    <span className="typography-title-sm">
                      {patientProfileFullName(patient)}
                    </span>
                    <span className="text-description">
                      {formatPatientDateOfBirth(patient.dateOfBirth, locale)}
                    </span>
                  </div>
                  <Chip size="xs" color="neutral" coloringStyle="tonal">
                    {formatInsuranceChipLabel(patient.insurance)}
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </QueryState>
      </div>
    </Page>
  )
}

export default PatientsPage
