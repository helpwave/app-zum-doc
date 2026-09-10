import { Chip } from '@helpwave/hightide'
import type { PatientRequestStatus, PatientRequestType } from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'
import { requestStatusLabel, requestTypeLabel } from '@/lib/labels'

type ChipColor = 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'neutral'

export function statusChipColor(status: PatientRequestStatus): ChipColor {
  if (status === 'cancelled') {
    return 'negative'
  }
  if (status === 'requested' || status === 'inProgress') {
    return 'warning'
  }
  return 'positive'
}

export function typeChipColor(kind: PatientRequestType): ChipColor {
  if (kind === 'appointment') {
    return 'secondary'
  }
  if (kind === 'prescription') {
    return 'primary'
  }
  return 'neutral'
}

export function RequestStatusChip({ status }: { status: PatientRequestStatus }) {
  const t = useAdministrationTranslation()
  return (
    <Chip color={statusChipColor(status)} coloringStyle="tonal" size="sm">
      {requestStatusLabel(status, t)}
    </Chip>
  )
}

export function RequestTypeChip({ kind }: { kind: PatientRequestType }) {
  const t = useAdministrationTranslation()
  return (
    <Chip color={typeChipColor(kind)} coloringStyle="tonal" size="sm">
      {requestTypeLabel(kind, t)}
    </Chip>
  )
}
