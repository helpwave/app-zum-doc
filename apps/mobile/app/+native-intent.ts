import { getShareExtensionKey } from "expo-share-intent"

function backupMigrationHref(path: string): string {
  return `/migration?uri=${encodeURIComponent(path)}`
}

export function redirectSystemPath({
  path,
}: {
  path: string
  initial: boolean
}) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      return "/migration"
    }
    let decoded = path
    try {
      decoded = decodeURIComponent(path)
    } catch {
      decoded = path
    }
    const lower = decoded.toLowerCase()
    const isBackup = lower.includes(".azd-backup")
      || lower.includes("application/vnd.azd.backup")
      || lower.includes("application/x-azd-backup")
    if (!isBackup) {
      return path
    }
    return backupMigrationHref(path)
  } catch {
    return path
  }
}
