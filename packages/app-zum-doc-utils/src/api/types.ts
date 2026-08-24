import type {
  AppLocale,
  ChatMessageType,
  DoctorsOfficeStatus,
  MedicationSize,
  MessageDirection,
  MessageStatus,
  PatientRequestStatus,
  PatientRequestType,
  UserStatus,
  Weekday,
} from "./enums"

export * from "./enums"

export type Contact = {
  id: string
  name: string
  subtitle?: string
  initials?: string
  imageUri?: string | null
  presence: UserStatus
}

export type Conversation = {
  id: string
  contact: Contact
  lastMessage: string
  timeLabel: string
  unreadCount: number
  sentByMe: boolean
}

export type TextMessage = {
  id: string
  type: Extract<ChatMessageType, "text">
  direction: MessageDirection
  body: string
  timeLabel: string
  receipt?: MessageStatus
}

export type DateDividerMessage = {
  id: string
  type: Extract<ChatMessageType, "date">
  label: string
}

export type SystemMessage = {
  id: string
  type: Extract<ChatMessageType, "system">
  body: string
}

export type StructuredCardMessage = {
  id: string
  type: Extract<ChatMessageType, "card">
  direction: MessageDirection
  kind: PatientRequestType
  title: string
  subtitle: string
  primary: string
  detail: string
  mainActionId?: string
  selectedActionId?: string
  timeLabel: string
  actions?: {
    id: string
    label: string
  }[]
}

export type AttachmentMessage = {
  id: string
  type: Extract<ChatMessageType, "attachment">
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

export type HomeQuickAction = {
  id: PatientRequestType
  label: string
  href: string
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

export type HomeRequest = {
  id: string
  doctorsOfficeId: string
  doctorName: string
  title: string
  kind: PatientRequestType
  kindLabel: string
  status: PatientRequestStatus
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

export type MedicationCatalogItem = {
  id: string
  name: string
}

export type Medication = {
  id: string
  name: string
  size: MedicationSize
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
  status: PatientRequestStatus
}

export type CreateAppointmentInput = {
  doctorsOfficeId: string
  profileId: string
  date: string
  time: string
  isEmergency: boolean
  note: string
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
  status: PatientRequestStatus
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
  status: PatientRequestStatus
}

export type CreateReferralInput = {
  doctorsOfficeId: string
  profileId: string
  specialistDoctorsOfficeId: string
  reason: string
}
