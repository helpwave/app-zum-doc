import {
  fileNameFromUri,
  isAzdBackupFileName,
  isAzdBackupIncomingPath,
} from "@app-zum-doc/utils/api"
import * as Linking from "expo-linking"
import { useRouter, type Href } from "expo-router"
import { getShareExtensionKey, useShareIntentContext } from "expo-share-intent"
import { useEffect } from "react"

function backupFileFromShareIntent(
  files: readonly { path?: string, fileName?: string, mimeType?: string }[] | undefined,
) {
  if (files == null) {
    return undefined
  }
  return files.find((file) => {
    const name = file.fileName ?? fileNameFromUri(file.path ?? "")
    const mimeType = file.mimeType ?? ""
    return isAzdBackupFileName(name)
      || isAzdBackupIncomingPath(file.path ?? "")
      || mimeType.includes("azd.backup")
      || mimeType.includes("x-azd-backup")
  }) ?? files[0]
}

function isShareExtensionUrl(url: string) {
  return url.includes(`dataUrl=${getShareExtensionKey()}`)
}

function isOpenedBackupDocument(url: string) {
  if (isShareExtensionUrl(url)) {
    return false
  }
  if (isAzdBackupIncomingPath(url)) {
    return true
  }
  const parsed = Linking.parse(url)
  return parsed.scheme === "content" || parsed.scheme === "file"
}

function openMigration(router: ReturnType<typeof useRouter>, uri: string) {
  router.push({
    pathname: "/migration",
    params: { uri },
  } as Href)
}

export function useBackupShareIntent() {
  const router = useRouter()
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()

  useEffect(() => {
    if (!hasShareIntent) {
      return
    }
    const file = backupFileFromShareIntent(shareIntent.files ?? undefined)
    const uri = file?.path
    if (uri == null || uri.length === 0) {
      return
    }
    openMigration(router, uri)
    resetShareIntent()
  }, [hasShareIntent, resetShareIntent, router, shareIntent.files])

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (url == null || url.length === 0 || !isOpenedBackupDocument(url)) {
        return
      }
      openMigration(router, url)
    }

    void Linking.getInitialURL().then(handleUrl)
    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url)
    })
    return () => {
      subscription.remove()
    }
  }, [router])
}
