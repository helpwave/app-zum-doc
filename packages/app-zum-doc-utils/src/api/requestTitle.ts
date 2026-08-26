import type { AppLocale } from "./enums"
import { parseIsoDate } from "./openingHours"

function parseAppointmentDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const dateTime = parseIsoDate(date)
  dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return dateTime
}

function englishOrdinal(day: number): string {
  const remainder = day % 10
  const suffix =
    remainder === 1 && day !== 11
      ? "st"
      : remainder === 2 && day !== 12
        ? "nd"
        : remainder === 3 && day !== 13
          ? "rd"
          : "th"
  return `${day}${suffix}`
}

function formatWeekdayShort(date: Date, locale: AppLocale): string {
  if (locale === "de-DE") {
    return date.toLocaleDateString(locale, { weekday: "short" })
  }
  const weekday = date.toLocaleDateString(locale, { weekday: "short" })
  return `${weekday.slice(0, 2)}.`
}

function formatAppointmentTime(time: string, locale: AppLocale): string {
  const [hoursText, minutesText] = time.split(":")
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (locale === "de-DE") {
    return `${hoursText}:${minutesText} Uhr`
  }

  const period = hours >= 12 ? "p.m." : "a.m."
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`
}

export function formatAppointmentRequestTitle(
  date: string,
  time: string,
  locale: AppLocale,
): string {
  const dateTime = parseAppointmentDateTime(date, time)
  const weekday = formatWeekdayShort(dateTime, locale)
  const month = dateTime.toLocaleDateString(locale, { month: "long" })
  const year = dateTime.getFullYear()
  const timePart = formatAppointmentTime(time, locale)

  if (locale === "de-DE") {
    const day = dateTime.getDate()
    return `${weekday} ${day}. ${month} ${year} – ${timePart}`
  }

  const day = englishOrdinal(dateTime.getDate())
  return `${weekday} ${day} ${month} ${year} – ${timePart}`
}

export function formatPrescriptionRequestTitle(
  medicationNames: string[],
): string {
  return medicationNames.join(", ")
}

export function formatReferralRequestTitle(
  specialization: string,
): string {
  return specialization
}
