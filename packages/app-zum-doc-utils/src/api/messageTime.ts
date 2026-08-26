import type { AppLocale } from "./enums/appLocale"
import type { MessageStatus } from "./enums/messageStatus"

export function formatMessageTime(time: Date, locale: AppLocale): string {
  return time.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatConversationPreviewTime(
  time: Date,
  locale: AppLocale,
): string {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMessageDay = new Date(
    time.getFullYear(),
    time.getMonth(),
    time.getDate(),
  )
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfMessageDay.getTime()) / 86_400_000,
  )

  if (dayDiff === 0) {
    return formatMessageTime(time, locale)
  }

  if (dayDiff === 1) {
    return locale === "en-US" ? "Yesterday" : "Gestern"
  }

  return time.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  })
}

export function formatDateDivider(date: Date, locale: AppLocale): string {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMessageDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfMessageDay.getTime()) / 86_400_000,
  )
  const timePart = formatMessageTime(date, locale)

  if (dayDiff === 0) {
    return locale === "en-US" ? `Today · ${timePart}` : `Heute · ${timePart}`
  }

  if (dayDiff === 1) {
    return locale === "en-US" ? `Yesterday · ${timePart}` : `Gestern · ${timePart}`
  }

  const datePart = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  })

  return `${datePart} · ${timePart}`
}

export function showsReadReceipt(status: MessageStatus): boolean {
  return status === "read"
}

export function showsSentIndicator(status: MessageStatus): boolean {
  return status === "sent" || status === "read"
}
