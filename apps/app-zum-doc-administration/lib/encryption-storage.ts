import {
  encryptedKeyPairFileName,
  parseEncryptedKeyPairFile,
  stringifyEncryptedKeyPairFile,
  type EncryptedKeyPairFile
} from '@app-zum-doc/utils/api'

export const encryptionKeyStorageKey = 'app-zum-doc-encryption-key'

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

export function readEncryptedKeyPair(): EncryptedKeyPairFile | null {
  const stored = readEncryptionKey()
  if (!stored) {
    return null
  }
  return parseEncryptedKeyPairFile(stored)
}

export function hasEncryptedKeyPair(): boolean {
  return readEncryptedKeyPair() != null
}

export function writeEncryptionKey(value: string): void {
  window.localStorage.setItem(encryptionKeyStorageKey, value)
}

export function writeEncryptedKeyPair(file: EncryptedKeyPairFile): void {
  writeEncryptionKey(stringifyEncryptedKeyPairFile(file))
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

export function downloadEncryptionKeyFile(
  contents: string,
  fileName: string = encryptedKeyPairFileName
): void {
  const blob = new Blob([contents], { type: 'application/json' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = fileName
  link.click()
  URL.revokeObjectURL(href)
}
