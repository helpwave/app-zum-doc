import type { AppLocale } from "./enums/appLocale"
import type { PatientInsuranceInformation } from "./insurance"
import type { Medication } from "./medication"

export type PatientProfile = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  email: string
  phone: string
  insurance: PatientInsuranceInformation
  medicationList: Medication[]
}

export type PatientProfileSummary = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
}

export function patientProfileFullName(
  profile: Pick<PatientProfile, "firstName" | "lastName">,
): string {
  return `${profile.firstName} ${profile.lastName}`
}

export function toPatientProfileSummary(
  profile: PatientProfile,
): PatientProfileSummary {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
  }
}

export function formatPatientDateOfBirth(
  dateOfBirth: Date,
  locale: AppLocale,
): string {
  return dateOfBirth.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
