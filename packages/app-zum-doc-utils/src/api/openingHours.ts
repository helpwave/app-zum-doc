import type { DoctorsOfficeOpeningHours } from "./doctorsOffice"
import { WeekdayUtils, type DoctorsOfficeStatus, type Weekday } from "./enums"

const slotStepMinutes = 30
const afternoonStartMinutes = 13 * 60

export function weekdayFromDate(date: Date): Weekday {
  return WeekdayUtils.array[(date.getDay() + 6) % 7]
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseClock(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return null
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) {
    return null
  }
  return hours * 60 + minutes
}

function formatClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}:${String(minutes).padStart(2, "0")}`
}

function parseTimeRange(range: string): { start: number, end: number } | null {
  const parts = range.split("-").map((part) => part.trim())
  if (parts.length !== 2) {
    return null
  }
  const start = parseClock(parts[0] ?? "")
  const end = parseClock(parts[1] ?? "")
  if (start == null || end == null || end <= start) {
    return null
  }
  return { start, end }
}

export function isOfficeOpenOnDate(
  openingHours: DoctorsOfficeOpeningHours,
  date: Date,
): boolean {
  return timeSlotsOnDate(openingHours, date).length > 0
}

export function timeSlotsOnDate(
  openingHours: DoctorsOfficeOpeningHours,
  date: Date,
): string[] {
  const ranges = openingHours[weekdayFromDate(date)] ?? []
  const slots: string[] = []

  for (const range of ranges) {
    const parsed = parseTimeRange(range)
    if (!parsed) {
      continue
    }
    for (
      let minutes = parsed.start;
      minutes < parsed.end;
      minutes += slotStepMinutes
    ) {
      slots.push(formatClock(minutes))
    }
  }

  return [...new Set(slots)]
}

export function isDoctorsOfficeOpenNow(
  openingHours: DoctorsOfficeOpeningHours,
  date: Date = new Date(),
): boolean {
  const ranges = openingHours[weekdayFromDate(date)] ?? []
  const nowMinutes = date.getHours() * 60 + date.getMinutes()

  for (const range of ranges) {
    const parsed = parseTimeRange(range)
    if (parsed && nowMinutes >= parsed.start && nowMinutes < parsed.end) {
      return true
    }
  }

  return false
}

export function doctorsOfficeStatusFromOpeningHours(
  openingHours: DoctorsOfficeOpeningHours,
  date: Date = new Date(),
): DoctorsOfficeStatus {
  return isDoctorsOfficeOpenNow(openingHours, date) ? "open" : "closed"
}

export function isMorningSlot(time: string): boolean {
  const minutes = parseClock(time)
  return minutes != null && minutes < afternoonStartMinutes
}
