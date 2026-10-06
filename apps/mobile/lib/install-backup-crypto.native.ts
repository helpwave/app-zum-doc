import {
  backupMacBitLength,
  setBackupCryptoBackend,
} from "@app-zum-doc/utils/api"
import {
  Buffer,
  createDecipheriv,
  pbkdf2,
} from "react-native-quick-crypto"

function toBytes(value: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (value instanceof Uint8Array) {
    return new Uint8Array(value)
  }
  return new Uint8Array(value)
}

export function installBackupQuickCrypto() {
  setBackupCryptoBackend({
    derivePbkdf2HmacSha256: ({ password, salt, iterations, keyLength }) => (
      new Promise((resolve, reject) => {
        pbkdf2(
          Buffer.from(password),
          Buffer.from(salt),
          iterations,
          keyLength,
          "sha256",
          (error, derivedKey) => {
            if (error != null || derivedKey == null) {
              reject(error ?? new Error("PBKDF2 failed"))
              return
            }
            resolve(toBytes(derivedKey))
          },
        )
      })
    ),
    decryptAes256Gcm: ({ key, nonce, ciphertextAndTag, tagByteLength }) => {
      const tagLength = tagByteLength > 0
        ? tagByteLength
        : backupMacBitLength / 8
      if (ciphertextAndTag.byteLength <= tagLength) {
        return Promise.reject(new Error("Invalid backup ciphertext"))
      }
      const ciphertext = ciphertextAndTag.subarray(
        0,
        ciphertextAndTag.byteLength - tagLength,
      )
      const tag = ciphertextAndTag.subarray(ciphertextAndTag.byteLength - tagLength)
      const decipher = createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key),
        Buffer.from(nonce),
        { authTagLength: tagLength },
      )
      decipher.setAuthTag(Buffer.from(tag))
      const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertext)),
        decipher.final(),
      ])
      return Promise.resolve(toBytes(plaintext))
    },
  })
}
