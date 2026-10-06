const azdBackupFileSuffix = '.azd-backup'

export function isAzdBackupFileName(name: string): boolean {
  const trimmed = name.trim().toLowerCase()
  const withoutQuery = trimmed.split('?')[0] ?? trimmed
  return withoutQuery.endsWith(azdBackupFileSuffix)
}
