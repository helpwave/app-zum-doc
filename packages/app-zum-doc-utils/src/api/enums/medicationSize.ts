const medicationSizeValues = ["n1", "n2", "n3"] as const
export type MedicationSize = (typeof medicationSizeValues)[number]
const allowedMedicationSizeValues: ReadonlySet<string> = new Set(
  medicationSizeValues,
)
function isMedicationSizeValue(value: unknown): value is MedicationSize {
  if (typeof value !== "string") {
    return false
  }
  return allowedMedicationSizeValues.has(value)
}
export const MedicationSizeUtils = {
  array: medicationSizeValues,
  set: allowedMedicationSizeValues,
  typeCheck: isMedicationSizeValue,
}
