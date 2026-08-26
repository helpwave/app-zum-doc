import type { DoctorsOffice } from "./doctorsOffice"
import type { MedicationSize, PatientRequestStatus, PatientRequestType } from "./enums"
import type { Medication } from "./medication"

export type RequestBase = {
  id: string
  kind: PatientRequestType
  title: string
  doctorsOffice: DoctorsOffice
  profileId: string
  status: PatientRequestStatus
}

export type PatientRequest = Appointment | Prescription | Referral

export type Appointment = RequestBase & {
  date: string
  time: string
  isEmergency: boolean
  note: string
  sickNote?: string
}

export type CreateAppointmentInput = {
  doctorsOfficeId: string
  profileId: string
  date: string
  time: string
  isEmergency: boolean
  note: string
}

export type Prescription = RequestBase & {
  shipByMail: boolean
  note: string
  medications: Medication[]
}

export type CreatePrescriptionInput = {
  doctorsOfficeId: string
  profileId: string
  shipByMail: boolean
  note: string
  medications: Array<{
    name: string
    size: MedicationSize
  }>
}

export type Referral = RequestBase & {
  specialization: string
  reason: string
}

export type CreateReferralInput = {
  doctorsOfficeId: string
  profileId: string
  specialization: string
  reason: string
}

export type AppointmentRecord = Omit<
  Appointment,
  "doctorsOffice" | "kind" | "title"
> & {
  doctorsOfficeId: string
}

export type PrescriptionRecord = Omit<
  Prescription,
  "doctorsOffice" | "kind" | "title"
> & {
  doctorsOfficeId: string
}

export type ReferralRecord = Omit<
  Referral,
  "doctorsOffice" | "kind" | "title"
> & {
  doctorsOfficeId: string
}
