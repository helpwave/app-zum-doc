export type OpeningHoursRange = {
  start: string,
  end: string,
}

function padClock(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return ''
  }
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`
}

function clockToMinutes(value: string): number | null {
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

export function parseOpeningHoursRange(value: string): OpeningHoursRange | null {
  const parts = value.split('-').map((part) => part.trim())
  if (parts.length !== 2) {
    return null
  }
  const start = padClock(parts[0] ?? '')
  const end = padClock(parts[1] ?? '')
  if (!start || !end) {
    return null
  }
  return { start, end }
}

export function parseOpeningHoursDay(values: string[]): OpeningHoursRange[] {
  return values.flatMap((value) => {
    const range = parseOpeningHoursRange(value)
    return range ? [range] : []
  })
}

export function isOpeningHoursRangeInvalid(range: OpeningHoursRange): boolean {
  if (!range.start || !range.end) {
    return false
  }
  const start = clockToMinutes(range.start)
  const end = clockToMinutes(range.end)
  if (start == null || end == null) {
    return false
  }
  return end < start
}

export function serializeOpeningHoursDay(ranges: OpeningHoursRange[]): string[] {
  return ranges.flatMap((range) => {
    if (!range.start || !range.end || isOpeningHoursRangeInvalid(range)) {
      return []
    }
    return [`${range.start} - ${range.end}`]
  })
}

export function emptyOpeningHoursRange(): OpeningHoursRange {
  return { start: '', end: '' }
}
