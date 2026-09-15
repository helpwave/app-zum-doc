const appLocaleValues = ['de-DE', 'en-US'] as const
export type AppLocale = (typeof appLocaleValues)[number]
const allowedAppLocaleValues: ReadonlySet<string> = new Set(appLocaleValues)
function isAppLocaleValue(value: unknown): value is AppLocale {
  if (typeof value !== 'string') {
    return false
  }
  return allowedAppLocaleValues.has(value)
}
export const AppLocaleUtils = {
  array: appLocaleValues,
  set: allowedAppLocaleValues,
  typeCheck: isAppLocaleValue,
}

export function toAppLocale(locale: string): AppLocale {
  return locale === 'en-US' ? 'en-US' : 'de-DE'
}
