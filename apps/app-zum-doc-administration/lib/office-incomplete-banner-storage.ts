import { SafeGlobals } from '@helpwave/hightide'

export const officeIncompleteBannerTimerStorageKey = 'app-zum-doc.office-incomplete-banner-timer'

export function readOfficeIncompleteBannerTimer(): number | null {
  const win = SafeGlobals.window('readOfficeIncompleteBannerTimer')
  if (!win) {
    return null
  }
  const value =  win.localStorage.getItem(officeIncompleteBannerTimerStorageKey)
  if (!value || value.trim().length === 0) {
    return null
  }
  const timer = Number(value)
  if (!Number.isFinite(timer)) {
    return null
  }
  return timer
}

export function hasOfficeIncompleteBannerTimer(): boolean {
  return readOfficeIncompleteBannerTimer() != null
}

export function writeOfficeIncompleteBannerTimer(timer: number): void {
  const win = SafeGlobals.window('readOfficeIncompleteBannerTimer')
  if (!win) {
    return
  }
  win.localStorage.setItem(officeIncompleteBannerTimerStorageKey, String(timer))
}
