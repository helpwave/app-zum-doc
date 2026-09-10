import type {
  PatientRequestStatus,
  PatientRequestType,
  Weekday
} from '@app-zum-doc/utils/api'
import type { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

type Translate = ReturnType<typeof useAdministrationTranslation>

export function requestTypeLabel(
  kind: PatientRequestType,
  t: Translate
): string {
  if (kind === 'appointment') {
    return t('filterAppointments')
  }
  if (kind === 'prescription') {
    return t('filterPrescriptions')
  }
  return t('filterReferrals')
}

export function requestStatusLabel(
  status: PatientRequestStatus,
  t: Translate
): string {
  if (status === 'requested') {
    return t('statusRequested')
  }
  if (status === 'inProgress') {
    return t('statusInProgress')
  }
  if (status === 'confirmed') {
    return t('statusConfirmed')
  }
  if (status === 'readyForPickup') {
    return t('statusReadyForPickup')
  }
  if (status === 'completed') {
    return t('statusCompleted')
  }
  return t('statusCancelled')
}

export function statusActionLabel(
  status: PatientRequestStatus,
  t: Translate
): string {
  if (status === 'confirmed') {
    return t('actionConfirm')
  }
  if (status === 'readyForPickup') {
    return t('actionReadyForPickup')
  }
  if (status === 'completed') {
    return t('actionComplete')
  }
  return t('actionCancel')
}

export function weekdayLabel(day: Weekday, t: Translate): string {
  if (day === 'monday') {
    return t('weekdayMonday')
  }
  if (day === 'tuesday') {
    return t('weekdayTuesday')
  }
  if (day === 'wednesday') {
    return t('weekdayWednesday')
  }
  if (day === 'thursday') {
    return t('weekdayThursday')
  }
  if (day === 'friday') {
    return t('weekdayFriday')
  }
  if (day === 'saturday') {
    return t('weekdaySaturday')
  }
  return t('weekdaySunday')
}
