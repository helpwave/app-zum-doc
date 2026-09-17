export const encryptionTestPlaintext = 'app-zum-doc-encryption-ok'
export const encryptedKeyPairFormat = 'app-zum-doc-encrypted-key-pair'
export const encryptedKeyPairVersion = 1
export const encryptedKeyPairFileName = 'app-zum-doc-encrypted-key-pair.json'
export const pbkdf2IterationCount = 600000

const rsaAlgorithm = {
  name: 'RSA-OAEP',
  hash: 'SHA-256',
} as const

export type EncryptedKeyPairFile = {
  format: typeof encryptedKeyPairFormat,
  version: typeof encryptedKeyPairVersion,
  kdf: {
    algorithm: 'PBKDF2',
    hash: 'SHA-256',
    iterations: number,
    salt: string,
  },
  cipher: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    iv: string,
  },
  keyPair: {
    publicKey: {
      format: 'SPKI',
      key: string,
    },
    privateKey: {
      format: 'PKCS8',
      ciphertext: string,
    },
  },
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

export function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

export function arrayBuffersEqual(left: ArrayBuffer, right: ArrayBuffer): boolean {
  if (left.byteLength !== right.byteLength) {
    return false
  }
  const leftBytes = new Uint8Array(left)
  const rightBytes = new Uint8Array(right)
  for (let index = 0; index < leftBytes.length; index += 1) {
    if (leftBytes[index] !== rightBytes[index]) {
      return false
    }
  }
  return true
}

export function publicKeyFromEncryptedKeyPair(file: EncryptedKeyPairFile): ArrayBuffer {
  return base64ToArrayBuffer(file.keyPair.publicKey.key)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

export function isEncryptedKeyPairFile(value: unknown): value is EncryptedKeyPairFile {
  if (value == null || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  const kdf = record['kdf']
  const cipher = record['cipher']
  const keyPair = record['keyPair']
  if (kdf == null || typeof kdf !== 'object' || cipher == null || typeof cipher !== 'object' || keyPair == null || typeof keyPair !== 'object') {
    return false
  }
  const kdfRecord = kdf as Record<string, unknown>
  const cipherRecord = cipher as Record<string, unknown>
  const keyPairRecord = keyPair as Record<string, unknown>
  const publicKey = keyPairRecord['publicKey']
  const privateKey = keyPairRecord['privateKey']
  if (publicKey == null || typeof publicKey !== 'object' || privateKey == null || typeof privateKey !== 'object') {
    return false
  }
  const publicKeyRecord = publicKey as Record<string, unknown>
  const privateKeyRecord = privateKey as Record<string, unknown>
  return record['format'] === encryptedKeyPairFormat
    && record['version'] === encryptedKeyPairVersion
    && kdfRecord['algorithm'] === 'PBKDF2'
    && kdfRecord['hash'] === 'SHA-256'
    && typeof kdfRecord['iterations'] === 'number'
    && Number.isFinite(kdfRecord['iterations'])
    && kdfRecord['iterations'] > 0
    && isNonEmptyString(kdfRecord['salt'])
    && cipherRecord['algorithm'] === 'AES-GCM'
    && cipherRecord['keyLength'] === 256
    && isNonEmptyString(cipherRecord['iv'])
    && publicKeyRecord['format'] === 'SPKI'
    && isNonEmptyString(publicKeyRecord['key'])
    && privateKeyRecord['format'] === 'PKCS8'
    && isNonEmptyString(privateKeyRecord['ciphertext'])
}

export function parseEncryptedKeyPairFile(text: string): EncryptedKeyPairFile | null {
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isEncryptedKeyPairFile(parsed)) {
      return null
    }
    base64ToArrayBuffer(parsed.kdf.salt)
    base64ToArrayBuffer(parsed.cipher.iv)
    base64ToArrayBuffer(parsed.keyPair.publicKey.key)
    base64ToArrayBuffer(parsed.keyPair.privateKey.ciphertext)
    return parsed
  } catch {
    return null
  }
}

export function stringifyEncryptedKeyPairFile(file: EncryptedKeyPairFile): string {
  return `${JSON.stringify(file, null, 2)}\n`
}

async function importPublicKey(publicKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    publicKey,
    rsaAlgorithm,
    false,
    ['encrypt']
  )
}

async function importPrivateKey(privateKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    privateKey,
    rsaAlgorithm,
    false,
    ['decrypt']
  )
}

async function deriveWrappingKey(
  password: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
      salt,
    },
    material,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptWithPublicKey(
  publicKey: ArrayBuffer,
  plaintext: string
): Promise<string> {
  const key = await importPublicKey(publicKey)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    new TextEncoder().encode(plaintext)
  )
  return arrayBufferToBase64(encrypted)
}

export async function decryptWithPrivateKey(
  privateKey: CryptoKey,
  ciphertext: string
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    base64ToArrayBuffer(ciphertext)
  )
  return new TextDecoder().decode(decrypted)
}

export async function verifyPasswordForKeyPair(
  publicKey: ArrayBuffer,
  privateKey: CryptoKey
): Promise<boolean> {
  try {
    const ciphertext = await encryptWithPublicKey(publicKey, encryptionTestPlaintext)
    const plaintext = await decryptWithPrivateKey(privateKey, ciphertext)
    return plaintext === encryptionTestPlaintext
  } catch {
    return false
  }
}

export async function unlockEncryptedPrivateKey(
  file: EncryptedKeyPairFile,
  password: string
): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKey(
    password,
    base64ToArrayBuffer(file.kdf.salt),
    file.kdf.iterations
  )
  const pkcs8 = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToArrayBuffer(file.cipher.iv),
    },
    wrappingKey,
    base64ToArrayBuffer(file.keyPair.privateKey.ciphertext)
  )
  return importPrivateKey(pkcs8)
}

export async function createEncryptedKeyPairFile(password: string): Promise<{
  file: EncryptedKeyPairFile,
  publicKey: ArrayBuffer,
}> {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  )
  const [spki, pkcs8] = await Promise.all([
    crypto.subtle.exportKey('spki', pair.publicKey),
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
  ])
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const wrappingKey = await deriveWrappingKey(password, bytesToArrayBuffer(salt), pbkdf2IterationCount)
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    wrappingKey,
    pkcs8
  )
  return {
    publicKey: spki,
    file: {
      format: encryptedKeyPairFormat,
      version: encryptedKeyPairVersion,
      kdf: {
        algorithm: 'PBKDF2',
        hash: 'SHA-256',
        iterations: pbkdf2IterationCount,
        salt: arrayBufferToBase64(bytesToArrayBuffer(salt)),
      },
      cipher: {
        algorithm: 'AES-GCM',
        keyLength: 256,
        iv: arrayBufferToBase64(bytesToArrayBuffer(iv)),
      },
      keyPair: {
        publicKey: {
          format: 'SPKI',
          key: arrayBufferToBase64(spki),
        },
        privateKey: {
          format: 'PKCS8',
          ciphertext: arrayBufferToBase64(ciphertext),
        },
      },
    },
  }
}
