export type Presence = "online" | "offline"

export type Contact = {
  id: string
  name: string
  subtitle?: string
  initials?: string
  imageUri?: string | null
  presence: Presence
}

export type Conversation = {
  id: string
  contact: Contact
  lastMessage: string
  timeLabel: string
  unreadCount: number
  sentByMe: boolean
}

export type StructuredCardKind = "appointment" | "prescription" | "referral"

export type StructuredCardStatus = "pending" | "new" | "sent" | "confirmed" | "declined"

export type MessageDirection = "incoming" | "outgoing"

export type TextMessage = {
  id: string
  type: "text"
  direction: MessageDirection
  body: string
  timeLabel: string
  receipt?: "read" | "sent"
}

export type DateDividerMessage = {
  id: string
  type: "date"
  label: string
}

export type SystemMessage = {
  id: string
  type: "system"
  body: string
}

export type StructuredCardMessage = {
  id: string
  type: "card"
  direction: MessageDirection
  kind: StructuredCardKind
  title: string
  subtitle: string
  primary: string
  detail: string
  status: StructuredCardStatus
  statusLabel: string,
  timeLabel: string,
  actions?: {
    id: string
    label: string
    variant: "primary" | "secondary"
  }[]
}

export type AttachmentMessage = {
  id: string
  type: "attachment"
  direction: MessageDirection
  fileName: string
  fileType: string
  fileSize: string
  timeLabel: string
}

export type ChatMessage =
  | TextMessage
  | DateDividerMessage
  | SystemMessage
  | StructuredCardMessage
  | AttachmentMessage

export type HomeQuickActionId = "prescription" | "appointment" | "referral"

export type HomeQuickAction = {
  id: HomeQuickActionId
  label: string
  href: string
}

const doctorsOfficeStatusValues = ["open", "closed"] as const
export type DoctorsOfficeStatus = (typeof doctorsOfficeStatusValues)[number]
const allowedDoctorsOfficeStatusValues: ReadonlySet<string> = new Set(
  doctorsOfficeStatusValues,
)
function isDoctorsOfficeStatusValue(value: unknown): value is DoctorsOfficeStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedDoctorsOfficeStatusValues.has(value)
}
export const DoctorsOfficeStatusUtils = {
  array: doctorsOfficeStatusValues,
  set: allowedDoctorsOfficeStatusValues,
  typeCheck: isDoctorsOfficeStatusValue,
}

export type HomeDoctorCard = {
  id: string
  name: string
  specialty: string
  phone: string
  imageUri: string | null
  initials?: string
  status: DoctorsOfficeStatus
}

export type RequestKind = "prescription" | "appointment" | "referral"

export type RequestStatus =
  | "in_progress"
  | "confirmed"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"

export type HomeRequest = {
  id: string
  doctorsOfficeId: string
  doctorName: string
  title: string
  kind: RequestKind
  kindLabel: string
  status: RequestStatus
  statusLabel: string
}

export type HomeSummary = {
  quickActions: HomeQuickAction[]
  myDoctors: HomeDoctorCard[]
  recentRequests: HomeRequest[]
}

export type PatientProfile = {
  id: string
  fullName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  insuranceNumber: string
  insuranceType: string
  insuranceProviderId: string
  federalStateId: string
  email: string
  phone: string
  practiceName: string
  practiceAddress: string
  notificationsEnabled: boolean
}

const medicationSizeValues = ["n1", "n2", "n3"] as const
export type MedicationSize = (typeof medicationSizeValues)[number]
const allowedMedicationSizeValues: ReadonlySet<string> = new Set(
  medicationSizeValues,
)
function isMedicationSizeValue(value: unknown): value is MedicationSize {
  if (typeof value !== "string") {
    return false
  }
  return allowedMedicationSizeValues.has(value)
}
export const MedicationSizeUtils = {
  array: medicationSizeValues,
  set: allowedMedicationSizeValues,
  typeCheck: isMedicationSizeValue,
}

export type MedicationCatalogItem = {
  id: string
  name: string
}

export type Medication = {
  id: string
  name: string
  size: MedicationSize
}

const weekdayValues = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const
export type Weekday = (typeof weekdayValues)[number]
const allowedWeekdayValues: ReadonlySet<string> = new Set(weekdayValues)
function isWeekdayValue(value: unknown): value is Weekday {
  if (typeof value !== "string") {
    return false
  }
  return allowedWeekdayValues.has(value)
}
export const WeekdayUtils = {
  array: weekdayValues,
  set: allowedWeekdayValues,
  typeCheck: isWeekdayValue,
}

export type DoctorsOfficeOpeningHours = Record<Weekday, string[]>

export type DoctorsOffice = {
  id: string
  name: string
  specialty: string
  phone: string
  imageUri: string | null
  initials?: string
  status: DoctorsOfficeStatus
  isMyDoctor: boolean
  openingHours: DoctorsOfficeOpeningHours
  services: string[]
  addressLine1: string
  addressLine2: string
  websiteLabel: string
  websiteUrl: string
  additionalOfferLabel: string
}

export type AppLocale = "de-DE" | "en-US"

export function toAppLocale(locale: string): AppLocale {
  return locale === "en-US" ? "en-US" : "de-DE"
}

export type SearchCity = {
  id: string
  label: string
}

export type SearchSpecialization = {
  id: string
  label: string
}

export type DoctorSearchFilters = {
  query?: string
  cityId?: string
  specializationId?: string
  locale: AppLocale
}

const appointmentStatusValues = ["requested", "confirmed", "cancelled"] as const
export type AppointmentStatus = (typeof appointmentStatusValues)[number]
const allowedAppointmentStatusValues: ReadonlySet<string> = new Set(
  appointmentStatusValues,
)
function isAppointmentStatusValue(value: unknown): value is AppointmentStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedAppointmentStatusValues.has(value)
}
export const AppointmentStatusUtils = {
  array: appointmentStatusValues,
  set: allowedAppointmentStatusValues,
  typeCheck: isAppointmentStatusValue,
}

export type PatientProfileSummary = {
  id: string
  fullName: string
  dateOfBirth: string
}

export type Appointment = {
  id: string
  doctorsOfficeId: string
  doctorName: string
  doctorSpecialty: string
  doctorImageUri: string | null
  doctorInitials?: string
  profileId: string
  patientName: string
  patientDateOfBirth: string
  date: string
  time: string
  isEmergency: boolean
  note: string
  sickNote?: string
  status: AppointmentStatus
}

export type CreateAppointmentInput = {
  doctorsOfficeId: string
  profileId: string
  date: string
  time: string
  isEmergency: boolean
  note: string
}

const prescriptionStatusValues = [
  "in_progress",
  "ready_for_pickup",
  "cancelled",
] as const
export type PrescriptionStatus = (typeof prescriptionStatusValues)[number]
const allowedPrescriptionStatusValues: ReadonlySet<string> = new Set(
  prescriptionStatusValues,
)
function isPrescriptionStatusValue(value: unknown): value is PrescriptionStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedPrescriptionStatusValues.has(value)
}
export const PrescriptionStatusUtils = {
  array: prescriptionStatusValues,
  set: allowedPrescriptionStatusValues,
  typeCheck: isPrescriptionStatusValue,
}

export type PrescriptionMedication = {
  id: string
  name: string
  size: MedicationSize
}

export type Prescription = {
  id: string
  doctorsOfficeId: string
  doctorName: string
  doctorSpecialty: string
  doctorImageUri: string | null
  doctorInitials?: string
  profileId: string
  patientName: string
  shipByMail: boolean
  note: string
  medications: PrescriptionMedication[]
  status: PrescriptionStatus
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

const referralStatusValues = [
  "in_progress",
  "ready_for_pickup",
  "cancelled",
] as const
export type ReferralStatus = (typeof referralStatusValues)[number]
const allowedReferralStatusValues: ReadonlySet<string> = new Set(
  referralStatusValues,
)
function isReferralStatusValue(value: unknown): value is ReferralStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedReferralStatusValues.has(value)
}
export const ReferralStatusUtils = {
  array: referralStatusValues,
  set: allowedReferralStatusValues,
  typeCheck: isReferralStatusValue,
}

export type Referral = {
  id: string
  doctorsOfficeId: string
  doctorName: string
  doctorSpecialty: string
  doctorImageUri: string | null
  doctorInitials?: string
  profileId: string
  patientName: string
  specialistDoctorsOfficeId: string
  specialistName: string
  reason: string
  status: ReferralStatus
}

export type CreateReferralInput = {
  doctorsOfficeId: string
  profileId: string
  specialistDoctorsOfficeId: string
  reason: string
}
