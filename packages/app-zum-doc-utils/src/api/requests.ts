import type { DoctorsOffice } from "./doctorsOffice"
import type {
  MedicationSize,
  PatientRequestStatus,
  PatientRequestType,
} from "./enums"
import type { Medication } from "./medication"
import type { PatientProfileSummary } from "./patientProfile"

export type RequestBase = {
  id: string
  kind: PatientRequestType
  title: string
  doctorsOffice: DoctorsOffice
  profileId: string
  status: PatientRequestStatus
}

export type PatientRequest = Appointment | Prescription | Referral

export type PracticeRequest = PatientRequest & {
  patient: PatientProfileSummary
}

export type PracticeDashboardAppointment = {
  id: string
  time: string
  date: string
  patientName: string
  insuranceLabel: string
  reason: string
}

export type PracticeDashboardMessage = {
  conversationId: string
  patientName: string
  preview: string
  time: Date
}

export type PracticeRequestDistribution = {
  sickNotes: number
  referrals: number
  appointments: number
}

export type PracticeOverview = {
  office: DoctorsOffice
  openAppointments: number
  openPrescriptions: number
  openReferrals: number
  patientCount: number
  overdueMessageCount: number
  unreadChatCount: number
  todayAppointmentsGkv: number
  todayAppointmentsPkv: number
  requestDistribution: PracticeRequestDistribution
  todayAppointments: PracticeDashboardAppointment[]
  recentMessages: PracticeDashboardMessage[]
  recentRequests: PracticeRequest[]
}

const nextStatusesByKind: Record<
  PatientRequestType,
  Partial<Record<PatientRequestStatus, PatientRequestStatus[]>>
> = {
  appointment: {
    requested: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
  },
  prescription: {
    inProgress: ["readyForPickup", "cancelled"],
    readyForPickup: ["completed", "cancelled"],
  },
  referral: {
    inProgress: ["completed", "cancelled"],
  },
}

export function nextPatientRequestStatuses(
  kind: PatientRequestType,
  status: PatientRequestStatus,
): PatientRequestStatus[] {
  return nextStatusesByKind[kind][status] ?? []
}

export function isOpenPatientRequestStatus(
  status: PatientRequestStatus,
): boolean {
  return status !== "completed" && status !== "cancelled"
}

export function canTransitionPatientRequestStatus(
  kind: PatientRequestType,
  from: PatientRequestStatus,
  to: PatientRequestStatus,
): boolean {
  return nextPatientRequestStatuses(kind, from).includes(to)
}

export function isPracticeAppointment(
  request: PracticeRequest,
): request is Appointment & { patient: PatientProfileSummary } {
  return request.kind === "appointment"
}

export function isPracticePrescription(
  request: PracticeRequest,
): request is Prescription & { patient: PatientProfileSummary } {
  return request.kind === "prescription"
}

export function isPracticeReferral(
  request: PracticeRequest,
): request is Referral & { patient: PatientProfileSummary } {
  return request.kind === "referral"
}

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
