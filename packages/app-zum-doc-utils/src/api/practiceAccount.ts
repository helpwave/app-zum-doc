import type { Address } from './address'

export type PracticeOnboardingStatus = {
  hasDoctorsOffice: boolean,
  hasPublicKey: boolean,
}

export type PracticeEncryptionData = {
  publicKey: string | null,
}

export type PracticeMyData = {
  name: string,
  address: Address,
}

export type CompletePracticeOnboardingInput = {
  name: string,
  address: Address,
  specializationIds: string[],
}

export type EncryptionKeyTest = {
  ciphertext: string,
}
