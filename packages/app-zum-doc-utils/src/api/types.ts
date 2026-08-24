import type {
  AppLocale,
  DoctorsOfficeStatus,
  MedicationSize,
  PatientRequestStatus,
  PatientRequestType,
  Weekday,
} from "./enums"

export * from "./enums"
export * from "./insurance"
export * from "./message"
export * from "./patientProfile"

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
