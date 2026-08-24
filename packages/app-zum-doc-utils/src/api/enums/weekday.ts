const weekdayValues = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const
export type Weekday = (typeof weekdayValues)[number]
const allowedWeekdayValues: ReadonlySet<string> = new Set(weekdayValues)
function isWeekdayValue(value: unknown): value is Weekday {
  if (typeof value !== "string") {
    return false
  }
  return allowedWeekdayValues.has(value)
}
export const WeekdayUtils = {
  array: weekdayValues,
  set: allowedWeekdayValues,
  typeCheck: isWeekdayValue,
}
