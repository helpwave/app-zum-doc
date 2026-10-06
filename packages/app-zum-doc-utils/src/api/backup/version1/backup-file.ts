import { base64ToArrayBuffer } from '../../encryption'

const backupEncryptionAlgorithm = 'AES-256-GCM'
const backupEncryptionKdf = 'PBKDF2-HMAC-SHA256'
const backupEncryptionVersion = 1
const backupNonceLength = 12
const backupSaltLength = 32

export type BackupFileV1 = {
  encryption: {
    version: typeof backupEncryptionVersion,
    algorithm: typeof backupEncryptionAlgorithm,
    kdf: typeof backupEncryptionKdf,
    iterations: number,
    salt: string,
    nonce: string,
  },
  data: string,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isBackupFileV1(value: unknown): value is BackupFileV1 {
  if (!isRecord(value)) {
    return false
  }
  const encryption = value['encryption']
  if (!isRecord(encryption)) {
    return false
  }
  return encryption['version'] === backupEncryptionVersion
    && encryption['algorithm'] === backupEncryptionAlgorithm
    && encryption['kdf'] === backupEncryptionKdf
    && typeof encryption['iterations'] === 'number'
    && Number.isFinite(encryption['iterations'])
    && encryption['iterations'] > 0
    && isNonEmptyString(encryption['salt'])
    && isNonEmptyString(encryption['nonce'])
    && isNonEmptyString(value['data'])
}

export function backupFileV1Parse(text: string): BackupFileV1 {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Invalid backup file')
  }
  if (!isBackupFileV1(parsed)) {
    throw new Error('Invalid backup file')
  }
  const salt = new Uint8Array(base64ToArrayBuffer(parsed.encryption.salt))
  const nonce = new Uint8Array(base64ToArrayBuffer(parsed.encryption.nonce))
  base64ToArrayBuffer(parsed.data)
  if (salt.byteLength !== backupSaltLength || nonce.byteLength !== backupNonceLength) {
    throw new Error('Invalid backup file')
  }
  return parsed
}
