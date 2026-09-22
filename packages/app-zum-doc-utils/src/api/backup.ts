import { MedicationSizeUtils, type MedicationSize } from './enums/medicationSize'
import { base64ToArrayBuffer } from './encryption'
import type { PatientInsuranceInformation } from './insurance'
import type { Medication } from './medication'
import { parseIsoDate } from './openingHours'
import type { PatientProfile } from './patientProfile'

export const azdBackupFileExtension = 'azd-backup'
export const azdBackupFileSuffix = `.${azdBackupFileExtension}`
export const azdBackupMimeType = 'application/vnd.azd.backup'
export const azdBackupLegacyMimeType = 'application/x-azd-backup'
export const azdBackupAccept = [azdBackupFileSuffix, azdBackupMimeType, azdBackupLegacyMimeType] as const

export const backupEncryptionAlgorithm = 'AES-256-GCM'
export const backupEncryptionKdf = 'PBKDF2-HMAC-SHA256'
export const backupEncryptionVersion = 1
export const backupKeyLength = 32
export const backupMacBitLength = 128
export const backupNonceLength = 12
export const backupSaltLength = 32
export const backupDefaultIterations = 512000

export type EncryptedBackupFile = {
  encryption: {
    version: number,
    algorithm: typeof backupEncryptionAlgorithm,
    kdf: typeof backupEncryptionKdf,
    iterations: number,
    salt: string,
    nonce: string,
  },
  data: string,
}

export type PatientBackupPayload = {
  profile: PatientProfile,
  medications: Medication[],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

export function isAzdBackupFileName(name: string): boolean {
  const trimmed = name.trim().toLowerCase()
  const withoutQuery = trimmed.split('?')[0] ?? trimmed
  return withoutQuery.endsWith(azdBackupFileSuffix)
}

export function isAzdBackupIncomingPath(path: string): boolean {
  let decoded = path
  try {
    decoded = decodeURIComponent(path)
  } catch {
    decoded = path
  }
  const lower = decoded.toLowerCase()
  if (isAzdBackupFileName(lower)) {
    return true
  }
  if (lower.includes(azdBackupMimeType) || lower.includes(azdBackupLegacyMimeType)) {
    return true
  }
  return false
}

export function fileNameFromUri(uri: string): string {
  let decoded = uri
  try {
    decoded = decodeURIComponent(uri)
  } catch {
    decoded = uri
  }
  const withoutQuery = decoded.split('?')[0] ?? decoded
  const segments = withoutQuery.split(/[/\\]/)
  const last = segments[segments.length - 1]
  if (last && last.length > 0) {
    return last
  }
  return `backup${azdBackupFileSuffix}`
}

export function isEncryptedBackupFile(value: unknown): value is EncryptedBackupFile {
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

export function parseEncryptedBackupFile(text: string): EncryptedBackupFile | null {
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isEncryptedBackupFile(parsed)) {
      return null
    }
    const salt = new Uint8Array(base64ToArrayBuffer(parsed.encryption.salt))
    const nonce = new Uint8Array(base64ToArrayBuffer(parsed.encryption.nonce))
    base64ToArrayBuffer(parsed.data)
    if (salt.byteLength !== backupSaltLength || nonce.byteLength !== backupNonceLength) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function toUint8Array(buffer: ArrayBuffer): Uint8Array<ArrayBuffer> {
  return new Uint8Array<ArrayBuffer>(buffer)
}

export type BackupCryptoBackend = {
  derivePbkdf2HmacSha256: (input: {
    password: Uint8Array,
    salt: Uint8Array,
    iterations: number,
    keyLength: number,
  }) => Promise<Uint8Array>,
  decryptAes256Gcm: (input: {
    key: Uint8Array,
    nonce: Uint8Array,
    ciphertextAndTag: Uint8Array,
    tagByteLength: number,
  }) => Promise<Uint8Array>,
}

let backupCryptoBackend: BackupCryptoBackend | undefined

export function setBackupCryptoBackend(backend: BackupCryptoBackend | undefined) {
  backupCryptoBackend = backend
}

function decodeJsonBytes(bytes: Uint8Array): unknown {
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}

function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function getSubtleCrypto(): SubtleCrypto | undefined {
  const subtle = globalThis.crypto?.subtle
  if (subtle == null || typeof subtle.importKey !== 'function') {
    return undefined
  }
  return subtle
}

async function decryptWithWebCrypto(
  subtle: SubtleCrypto,
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  nonce: Uint8Array<ArrayBuffer>,
  ciphertext: Uint8Array<ArrayBuffer>,
  iterations: number
): Promise<unknown> {
  const material = await subtle.importKey(
    'raw',
    utf8ToBytes(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    material,
    {
      name: 'AES-GCM',
      length: backupKeyLength * 8,
    },
    false,
    ['decrypt']
  )
  const plaintext = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: backupMacBitLength,
    },
    key,
    ciphertext
  )
  return decodeJsonBytes(new Uint8Array(plaintext))
}

async function decryptWithBackend(
  password: string,
  salt: Uint8Array,
  nonce: Uint8Array,
  ciphertext: Uint8Array,
  iterations: number,
  backend: BackupCryptoBackend
): Promise<unknown> {
  const key = await backend.derivePbkdf2HmacSha256({
    password: utf8ToBytes(password),
    salt,
    iterations,
    keyLength: backupKeyLength,
  })
  const plaintext = await backend.decryptAes256Gcm({
    key,
    nonce,
    ciphertextAndTag: ciphertext,
    tagByteLength: backupMacBitLength / 8,
  })
  return decodeJsonBytes(plaintext)
}

function isSubtleUnavailableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('subtle')
      || message.includes('not supported')
      || message.includes('unsupported')
  }
  return false
}

export async function decryptEncryptedBackup(
  file: EncryptedBackupFile,
  password: string
): Promise<unknown> {
  const salt = toUint8Array(base64ToArrayBuffer(file.encryption.salt))
  const nonce = toUint8Array(base64ToArrayBuffer(file.encryption.nonce))
  const ciphertext = toUint8Array(base64ToArrayBuffer(file.data))
  if (nonce.byteLength !== backupNonceLength) {
    throw new Error('Invalid backup nonce')
  }

  if (backupCryptoBackend != null) {
    return decryptWithBackend(
      password,
      salt,
      nonce,
      ciphertext,
      file.encryption.iterations,
      backupCryptoBackend
    )
  }

  const subtle = getSubtleCrypto()
  if (subtle != null) {
    try {
      return await decryptWithWebCrypto(
        subtle,
        password,
        salt,
        nonce,
        ciphertext,
        file.encryption.iterations
      )
    } catch (error) {
      if (!isSubtleUnavailableError(error)) {
        throw error
      }
    }
  }

  throw new Error('Backup decryption is not available on this platform')
}

function readString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (isNonEmptyString(value)) {
      return value
    }
  }
  return undefined
}

function parseBackupDate(value: unknown): Date | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  if (!isNonEmptyString(value)) {
    return undefined
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseIsoDate(value)
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function parseInsurance(value: unknown): PatientInsuranceInformation {
  if (!isRecord(value)) {
    return {
      insuranceProviderId: '',
      insuranceNumber: '',
    }
  }
  return {
    insuranceProviderId: readString(value, 'insuranceProviderId', 'insurance_provider_id') ?? '',
    insuranceNumber: readString(value, 'insuranceNumber', 'insurance_number') ?? '',
  }
}

function parseMedications(value: unknown): Medication[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item, index) => {
    if (!isRecord(item)) {
      return []
    }
    const name = readString(item, 'name', 'label')
    const sizeValue = item['size']
    const size: MedicationSize = MedicationSizeUtils.typeCheck(sizeValue) ? sizeValue : 'n1'
    if (!name) {
      return []
    }
    return [{
      id: readString(item, 'id') ?? `imported-medication-${index + 1}`,
      name,
      size,
    }]
  })
}

function profileRecordFromPayload(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) {
    return null
  }
  const nestedKeys = ['profile', 'patient', 'user']
  for (const key of nestedKeys) {
    const nested = payload[key]
    if (isRecord(nested)) {
      return nested
    }
  }
  const data = payload['data']
  if (isRecord(data)) {
    for (const key of nestedKeys) {
      const nested = data[key]
      if (isRecord(nested)) {
        return nested
      }
    }
    if (readString(data, 'firstName', 'first_name') && readString(data, 'lastName', 'last_name')) {
      return data
    }
  }
  if (readString(payload, 'firstName', 'first_name') && readString(payload, 'lastName', 'last_name')) {
    return payload
  }
  return null
}

export function parsePatientBackupPayload(payload: unknown): PatientBackupPayload {
  const record = profileRecordFromPayload(payload)
  if (record == null) {
    throw new Error('Invalid backup payload')
  }
  const firstName = readString(record, 'firstName', 'first_name')
  const lastName = readString(record, 'lastName', 'last_name')
  const dateOfBirth = parseBackupDate(record['dateOfBirth'] ?? record['date_of_birth'])
  if (!firstName || !lastName || dateOfBirth == null) {
    throw new Error('Invalid backup payload')
  }
  const medications = parseMedications(
    record['medicationList']
    ?? record['medications']
    ?? (isRecord(payload) ? payload['medications'] ?? payload['medicationList'] : undefined)
  )
  const profile: PatientProfile = {
    id: readString(record, 'id') ?? 'imported-patient',
    firstName,
    lastName,
    dateOfBirth,
    email: readString(record, 'email') ?? '',
    phone: readString(record, 'phone', 'phoneNumber', 'phone_number') ?? '',
    insurance: parseInsurance(record['insurance']),
    medicationList: medications,
  }
  return {
    profile,
    medications,
  }
}
