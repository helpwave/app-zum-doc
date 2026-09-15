export const encryptionKeyStorageKey = 'app-zum-doc-encryption-key'
export const encryptionKeyFileName = 'app-zum-doc-encryption-key.pem'

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

export function downloadEncryptionKeyFile(contents: string): void {
  const blob = new Blob([contents], { type: 'application/octet-stream' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = encryptionKeyFileName
  link.click()
  URL.revokeObjectURL(href)
}
