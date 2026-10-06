import type { PatientProfileSummary } from './patientProfile'

export type OnboardingInformation = {
  mainProfile: PatientProfileSummary | null,
  managedProfiles: PatientProfileSummary[],
  hasOnboarded: boolean,
}

export type AppOnboardingMedicationInput = {
  name: string,
  packageSize: string,
}

export type AppOnboardingProfileInput = {
  id: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  phoneNumber: string,
  email: string,
  insurance: string,
  insuranceNumber: string,
  medications: AppOnboardingMedicationInput[],
}

export type CompleteAppOnboardingInput = {
  mainProfile: AppOnboardingProfileInput,
  managedProfiles: AppOnboardingProfileInput[],
}
