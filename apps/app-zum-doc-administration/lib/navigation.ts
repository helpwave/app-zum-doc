import {
  defaultPracticeOfficeId,
  type PatientRequestType
} from '@app-zum-doc/utils/api'

export const practiceOfficeId = defaultPracticeOfficeId

export function requestKindPath(kind: PatientRequestType): string {
  return `/requests?kind=${kind}`
}

export function parseRequestKind(
  value: string | string[] | undefined
): PatientRequestType | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === 'appointment' || raw === 'prescription' || raw === 'referral') {
    return raw
  }
  return undefined
}

export function activeNavUrl(
  path: string,
  kind?: PatientRequestType
): string {
  if (path.startsWith('/patients')) {
    return '/patients'
  }
  if (path.startsWith('/chat')) {
    return '/chat'
  }
  if (path.startsWith('/practice')) {
    return '/practice'
  }
  if (path.startsWith('/requests')) {
    if (kind === 'prescription') {
      return requestKindPath('prescription')
    }
    if (kind === 'referral') {
      return requestKindPath('referral')
    }
    return requestKindPath('appointment')
  }
  return '/'
}
