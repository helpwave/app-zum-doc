const patientRequestStatusValues = [
  'requested',
  'inProgress',
  'confirmed',
  'ready',
  'completed',
  'cancelled',
] as const
export type PatientRequestStatus = (typeof patientRequestStatusValues)[number]
const allowedPatientRequestStatusValues: ReadonlySet<string> = new Set(
  patientRequestStatusValues
)
function isPatientRequestStatusValue(
  value: unknown
): value is PatientRequestStatus {
  if (typeof value !== 'string') {
    return false
  }
  return allowedPatientRequestStatusValues.has(value)
}
export const PatientRequestStatusUtils = {
  array: patientRequestStatusValues,
  set: allowedPatientRequestStatusValues,
  typeCheck: isPatientRequestStatusValue,
}
