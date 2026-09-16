export const encryptionKeyStorageKey = 'app-zum-doc-encryption-key'
export const encryptionKeyFileName = 'app-zum-doc-private-key.txt'

export function readEncryptionKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  const value = window.localStorage.getItem(encryptionKeyStorageKey)
  if (!value || value.trim().length === 0) {
    return null
  }
  return value
}

export function writeEncryptionKey(value: string): void {
  window.localStorage.setItem(encryptionKeyStorageKey, value)
}

export function clearEncryptionKey(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(encryptionKeyStorageKey)
  window.localStorage.removeItem('app-zum-doc.encryption-key')
}

export function clearLocalUserData(): void {
  clearEncryptionKey()
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem('app-zum-doc-practice-account')
}

export function downloadEncryptionKeyFile(contents: string): void {
  const blob = new Blob([contents], { type: 'application/octet-stream' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = encryptionKeyFileName
  link.click()
  URL.revokeObjectURL(href)
}
