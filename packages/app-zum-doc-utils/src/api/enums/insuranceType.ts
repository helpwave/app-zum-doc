const insuranceTypeValues = ["private", "public"] as const
export type InsuranceType = (typeof insuranceTypeValues)[number]
const allowedInsuranceTypeValues: ReadonlySet<string> = new Set(insuranceTypeValues)
function isInsuranceTypeValue(value: unknown): value is InsuranceType {
  if (typeof value !== "string") {
    return false
  }
  return allowedInsuranceTypeValues.has(value)
}
export const InsuranceTypeUtils = {
  array: insuranceTypeValues,
  set: allowedInsuranceTypeValues,
  typeCheck: isInsuranceTypeValue,
}
