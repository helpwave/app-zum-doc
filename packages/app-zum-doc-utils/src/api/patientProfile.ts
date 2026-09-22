import type { AppLocale } from './enums/appLocale'
import type { PatientInsuranceInformation } from './insurance'
import type { Medication } from './medication'

export type PatientProfile = {
  id: string,
  firstName: string,
  lastName: string,
  dateOfBirth: Date,
  email: string,
  phone: string,
  insurance: PatientInsuranceInformation,
  medicationList: Medication[],
}

export type PatientProfileSummary = {
  id: string,
  firstName: string,
  lastName: string,
  dateOfBirth: Date,
  insurance: PatientInsuranceInformation,
  medicationCount: number,
}

export function patientProfileFullName(
  profile: Pick<PatientProfile, 'firstName' | 'lastName'>
): string {
  return `${profile.firstName} ${profile.lastName}`
}

export function toPatientProfileSummary(
  profile: PatientProfile
): PatientProfileSummary {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
    insurance: { ...profile.insurance },
    medicationCount: profile.medicationList.length,
  }
}

export function formatPatientDateOfBirth(
  dateOfBirth: Date,
  locale: AppLocale
): string {
  return dateOfBirth.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatPatientDayMonth(
  date: Date,
  locale: AppLocale
): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  })
}

export function formatPatientDateLong(
  date: Date,
  locale: AppLocale
): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPatientDateTimeLong(
  date: Date,
  locale: AppLocale
): string {
  const datePart = formatPatientDateLong(date, locale)
  const timePart = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} - ${timePart}`
}

export function patientAgeYears(
  dateOfBirth: Date,
  now: Date = new Date()
): number {
  let age = now.getFullYear() - dateOfBirth.getFullYear()
  const monthDelta = now.getMonth() - dateOfBirth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dateOfBirth.getDate())) {
    age -= 1
  }
  return age
}

export type PracticePatient = PatientProfile & {
  lastVisit: Date,
  lastChangedAt: Date,
  lastChangedBy: string,
  insuranceCardCurrent: boolean,
  blocked: boolean,
}

export type CreatePracticePatientInput = {
  firstName: string,
  lastName: string,
  dateOfBirth: string,
}

export type CreatePatientProfileInput = {
  firstName: string,
  lastName: string,
  dateOfBirth: string,
}
