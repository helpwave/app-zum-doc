import {
  defaultPracticeOfficeId,
  PatientRequestStatusUtils,
  type PatientRequestStatus,
  type PatientRequestType
} from '@app-zum-doc/utils/api'

export const practiceOfficeId = defaultPracticeOfficeId

export function requestKindPath(kind: PatientRequestType): string {
  return `/requests/${kind}`
}

export function parseRequestKind(
  value: string | undefined
): PatientRequestType | undefined {
  if (value === 'appointment' || value === 'prescription' || value === 'referral') {
    return value
  }
  return undefined
}

export function parseRequestKindFromPath(
  path: string
): PatientRequestType | undefined {
  const segment = path.split('/').filter(Boolean)[1]
  return parseRequestKind(segment)
}

export function requestStatusFiltersForKind(
  kind?: PatientRequestType
): PatientRequestStatus[] {
  if (kind === 'appointment') {
    return ['requested', 'confirmed', 'completed', 'cancelled']
  }
  if (kind === 'prescription') {
    return ['inProgress', 'ready', 'completed', 'cancelled']
  }
  if (kind === 'referral') {
    return ['inProgress', 'completed', 'cancelled']
  }
  return [...PatientRequestStatusUtils.array]
}

export function activeNavUrl(path: string): string {
  if (path.startsWith('/patients')) {
    return '/patients'
  }
  if (path.startsWith('/chat')) {
    return '/chat'
  }
  if (path.startsWith('/my-doctors-office') || path.startsWith('/practice') || path.startsWith('/app-entry')) {
    return '/my-doctors-office'
  }
  if (path.startsWith('/settings')) {
    return '/settings'
  }
  if (path.startsWith('/requests')) {
    const kind = parseRequestKindFromPath(path)
    if (kind) {
      return requestKindPath(kind)
    }
    return '/requests'
  }
  return '/'
}
