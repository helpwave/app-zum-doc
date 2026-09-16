export const encryptionTestPlaintext = 'app-zum-doc-encryption-ok'

export type EncryptionKeyPair = {
  publicKey: string,
  privateKey: string,
}

const rsaAlgorithm = {
  name: 'RSA-OAEP',
  hash: 'SHA-256',
} as const

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

function toPem(label: string, buffer: ArrayBuffer): string {
  const body = arrayBufferToBase64(buffer).match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

function extractPem(text: string, label: string): string | undefined {
  const match = text.match(new RegExp(`-----BEGIN ${label}-----[\\s\\S]*?-----END ${label}-----`))
  return match?.[0]
}

function pemToBuffer(pem: string, label: string): ArrayBuffer {
  const match = pem.match(new RegExp(`-----BEGIN ${label}-----([\\s\\S]*?)-----END ${label}-----`))
  if (!match?.[1]) {
    throw new Error('Invalid key file')
  }
  return base64ToArrayBuffer(match[1].replace(/\s+/g, ''))
}

async function importPublicKey(publicKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    pemToBuffer(publicKey, 'PUBLIC KEY'),
    rsaAlgorithm,
    false,
    ['encrypt']
  )
}

async function importPrivateKey(privateKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    pemToBuffer(privateKey, 'PRIVATE KEY'),
    rsaAlgorithm,
    false,
    ['decrypt']
  )
}

export function parseEncryptionKeyFile(text: string): {
  publicKey?: string,
  privateKey?: string,
} {
  const publicKey = extractPem(text, 'PUBLIC KEY')
  const privateKey = extractPem(text, 'PRIVATE KEY')
  return {
    ...(publicKey ? { publicKey } : {}),
    ...(privateKey ? { privateKey } : {}),
  }
}

export async function generateEncryptionKeyPair(): Promise<EncryptionKeyPair> {
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
  return {
    publicKey: toPem('PUBLIC KEY', spki),
    privateKey: toPem('PRIVATE KEY', pkcs8),
  }
}

export async function encryptWithPublicKey(
  publicKey: string,
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
  privateKey: string,
  ciphertext: string
): Promise<string> {
  const key = await importPrivateKey(privateKey)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    key,
    base64ToArrayBuffer(ciphertext)
  )
  return new TextDecoder().decode(decrypted)
}

export async function encryptionKeysMatch(
  publicKey: string,
  privateKey: string
): Promise<boolean> {
  try {
    const ciphertext = await encryptWithPublicKey(publicKey, encryptionTestPlaintext)
    const plaintext = await decryptWithPrivateKey(privateKey, ciphertext)
    return plaintext === encryptionTestPlaintext
  } catch {
    return false
  }
}
