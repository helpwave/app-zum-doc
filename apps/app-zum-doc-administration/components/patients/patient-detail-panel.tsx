import { Ban, CircleCheck, Trash2 } from 'lucide-react'
import {
  Button,
  Chip,
  ConfirmDialog,
  TabList,
  TabPanel,
  TabSwitcher
} from '@helpwave/hightide'
import {
  findInsuranceCompany,
  formatPatientDateLong,
  formatPatientDateOfBirth,
  formatPatientDateTimeLong,
  patientAgeYears,
  patientProfileFullName,
  type AppLocale,
  type PracticePatient
} from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function PatientDetailPanel({
  patient,
  locale,
  onDelete,
  onToggleBlocked,
  isDeleting,
  isBlocking,
}: {
  patient: PracticePatient,
  locale: AppLocale,
  onDelete: () => void,
  onToggleBlocked: () => void,
  isDeleting: boolean,
  isBlocking: boolean,
}) {
  const t = useAdministrationTranslation()
  const company = findInsuranceCompany(patient.insurance.insuranceProviderId)
  const age = patientAgeYears(patient.dateOfBirth)
  const name = patientProfileFullName(patient)

  return (
    <aside className="patient-detail-panel">
      <div className="flex-col-1">
        <span className="text-description typography-label-md">
          {company?.name ?? patient.insurance.insuranceProviderId}
        </span>
        <h2 className="typography-title-md text-primary">{name}</h2>
        <span className="text-description">
          {t('patientNumber', { number: patient.insurance.insuranceNumber })}
        </span>
        {patient.blocked && (
          <Chip size="xs" color="negative" coloringStyle="tonal">
            {t('patientBlocked')}
          </Chip>
        )}
      </div>

      <TabSwitcher>
        <TabList className="w-full"/>
        <TabPanel label={t('patientInformation')} initiallyActive>
          <dl className="patient-detail-fields">
            <div className="patient-detail-field">
              <dt>{t('patientColumnDateOfBirth')}</dt>
              <dd>
                {formatPatientDateOfBirth(patient.dateOfBirth, locale)}
                {' '}
                {t('patientAge', { age: String(age) })}
              </dd>
            </div>
            <div className="patient-detail-field">
              <dt>{t('patientColumnLastVisit')}</dt>
              <dd>{formatPatientDateLong(patient.lastVisit, locale)}</dd>
            </div>
            <div className="patient-detail-field">
              <dt>{t('insuranceCard')}</dt>
              <dd>
                <Chip
                  size="xs"
                  color={patient.insuranceCardCurrent ? 'positive' : 'warning'}
                  coloringStyle="tonal"
                >
                  <CircleCheck className="size-3.5" />
                  {patient.insuranceCardCurrent
                    ? t('insuranceCardCurrent')
                    : t('insuranceCardExpired')}
                </Chip>
              </dd>
            </div>
            <div className="patient-detail-field">
              <dt>{t('lastChanged')}</dt>
              <dd className="text-right">
                <span className="block">{patient.lastChangedBy}</span>
                <span className="text-description">
                  {formatPatientDateTimeLong(patient.lastChangedAt, locale)}
                </span>
              </dd>
            </div>
          </dl>

          <div className="flex-row-2 flex-wrap mt-6">
            <Button
              color="negative"
              coloringStyle="text"
              className="self-start !min-w-0"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="size-4" />
              {t('deletePatient')}
            </Button>
            <Button
              color="negative"
              coloringStyle="text"
              className="self-start !min-w-0"
              onClick={onToggleBlocked}
              disabled={isBlocking}
            >
              <Ban className="size-4" />
              {patient.blocked ? t('unblockPatient') : t('blockPatient')}
            </Button>
          </div>
        </TabPanel>
        <TabPanel label={t('patientPrescriptions')}>
          {patient.medicationList.length === 0 ? (
            <p className="text-description">{t('noPatientMedications')}</p>
          ) : (
            <ul className="flex-col-2">
              {patient.medicationList.map((medication) => (
                <li key={medication.id} className="flex-row-2 justify-between">
                  <span>{medication.name}</span>
                  <span className="text-description">{medication.size.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>
      </TabSwitcher>
    </aside>
  )
}

export function DeletePatientDialog({
  patient,
  isOpen,
  onCancel,
  onConfirm,
}: {
  patient: PracticePatient | undefined,
  isOpen: boolean,
  onCancel: () => void,
  onConfirm: () => void,
}) {
  const t = useAdministrationTranslation()
  if (!patient) {
    return null
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      titleElement={t('deletePatientTitle')}
      description={t('deletePatientDescription', {
        name: patientProfileFullName(patient),
      })}
      confirmType="negative"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
