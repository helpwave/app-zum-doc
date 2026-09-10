import type { AppLocale } from '@app-zum-doc/utils/api'

export function formatDashboardMessageTime(
  time: Date,
  locale: AppLocale
): string {
  const clock = time.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMessageDay = new Date(
    time.getFullYear(),
    time.getMonth(),
    time.getDate()
  )
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfMessageDay.getTime()) / 86_400_000
  )

  if (dayDiff === 0) {
    return clock
  }
  if (dayDiff === 1) {
    return locale === 'en-US' ? `Yesterday ${clock}` : `Gestern ${clock}`
  }
  const datePart = time.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  })
  return `${datePart} ${clock}`
}

export function formatDashboardDateHeading(
  date: Date,
  locale: AppLocale
): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  })
}

export function formatNewsDate(date: Date, locale: AppLocale): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
