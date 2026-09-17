import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'

export type EncryptionContextValue = {
  publicKey?: ArrayBuffer,
  setPublicKey: (value: ArrayBuffer) => void,
  privateKey?: CryptoKey,
  setPrivateKey: (value: CryptoKey) => void,
}

const EncryptionContext = createContext<EncryptionContextValue | null>(null)

export function EncryptionProvider({
  children,
}: {
  children: ReactNode,
}) {
  const [publicKey, setPublicKey] = useState<ArrayBuffer>()
  const [privateKey, setPrivateKey] = useState<CryptoKey>()
  const value = useMemo(
    (): EncryptionContextValue => ({
      publicKey,
      setPublicKey,
      privateKey,
      setPrivateKey,
    }),
    [publicKey, privateKey]
  )

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  )
}

export function useEncryption(): EncryptionContextValue {
  const value = useContext(EncryptionContext)
  if (value == null) {
    throw new Error('EncryptionContext is missing')
  }
  return value
}
