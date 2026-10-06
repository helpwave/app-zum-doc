import { formatPatientDateOfBirth, type AppLocale } from "@app-zum-doc/utils/api"

export function onboardingProfileDateLabel(value: string, locale: AppLocale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const [yearText, monthText, dayText] = value.split("-")
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText))
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return formatPatientDateOfBirth(date, locale)
}
