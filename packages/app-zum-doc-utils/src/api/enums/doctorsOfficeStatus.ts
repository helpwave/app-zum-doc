const doctorsOfficeStatusValues = ["open", "closed"] as const
export type DoctorsOfficeStatus = (typeof doctorsOfficeStatusValues)[number]
const allowedDoctorsOfficeStatusValues: ReadonlySet<string> = new Set(
  doctorsOfficeStatusValues,
)
function isDoctorsOfficeStatusValue(value: unknown): value is DoctorsOfficeStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedDoctorsOfficeStatusValues.has(value)
}
export const DoctorsOfficeStatusUtils = {
  array: doctorsOfficeStatusValues,
  set: allowedDoctorsOfficeStatusValues,
  typeCheck: isDoctorsOfficeStatusValue,
}
