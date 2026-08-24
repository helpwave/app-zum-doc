const patientRequestTypeValues = ["appointment", "prescription", "referral"] as const
export type PatientRequestType = (typeof patientRequestTypeValues)[number]
const allowedPatientRequestTypeValues: ReadonlySet<string> = new Set(
  patientRequestTypeValues,
)
function isPatientRequestTypeValue(value: unknown): value is PatientRequestType {
  if (typeof value !== "string") {
    return false
  }
  return allowedPatientRequestTypeValues.has(value)
}
export const PatientRequestTypeUtils = {
  array: patientRequestTypeValues,
  set: allowedPatientRequestTypeValues,
  typeCheck: isPatientRequestTypeValue,
}
