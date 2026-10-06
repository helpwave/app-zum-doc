import { base64ToArrayBuffer } from '../../encryption'
import type { BackupFileV1 } from './backup-file'

const backupKeyLength = 32
export const backupMacBitLength = 128
const backupNonceLength = 12

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

function plaintextFromBytes(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

function utf8ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(value)
  const bytes = new Uint8Array(encoded.byteLength)
  bytes.set(encoded)
  return bytes
}

function toUint8Array(buffer: ArrayBuffer): Uint8Array<ArrayBuffer> {
  return new Uint8Array<ArrayBuffer>(buffer)
}

function getSubtleCrypto(): SubtleCrypto | undefined {
  const subtle = globalThis.crypto?.subtle
  if (subtle == null || typeof subtle.importKey !== 'function') {
    return undefined
  }
  return subtle
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

async function decryptWithWebCrypto(
  subtle: SubtleCrypto,
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  nonce: Uint8Array<ArrayBuffer>,
  ciphertext: Uint8Array<ArrayBuffer>,
  iterations: number
): Promise<string> {
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
  return plaintextFromBytes(new Uint8Array(plaintext))
}

async function decryptWithBackend(
  password: string,
  salt: Uint8Array,
  nonce: Uint8Array,
  ciphertext: Uint8Array,
  iterations: number,
  backend: BackupCryptoBackend
): Promise<string> {
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
  return plaintextFromBytes(plaintext)
}

export async function decryptBackupFileV1(file: BackupFileV1, password: string): Promise<string> {
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
