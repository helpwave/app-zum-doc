import type { Address } from './address'
import type { Weekday } from './enums'

export type DoctorsOfficeOpeningHours = Record<Weekday, string[]>

export type Doctor = {
  id: string,
  name: string,
  imageUri?: string,
}

export type DoctorService = {
  id: string,
  name: string,
  description?: string,
  url?: string,
}

export type UpdateDoctorsOfficeServiceInput = {
  id: string,
  name: string,
  description?: string,
  url?: string,
}

export type DoctorsOfficeOnlineServices = {
  orderPrescriptions: boolean,
  shipPrescriptionByMail: boolean,
  orderReferrals: boolean,
  receiveDocuments: boolean,
  requestAppointments: boolean,
}

export type MyDoctors = {
  doctorIds: string[],
}

export const defaultPracticeOfficeId = 'office-moser'

export function defaultDoctorsOfficeOnlineServices(): DoctorsOfficeOnlineServices {
  return {
    orderPrescriptions: false,
    shipPrescriptionByMail: false,
    orderReferrals: false,
    receiveDocuments: false,
    requestAppointments: false,
  }
}

export type DoctorsOfficeEmailNotifications = {
  requestEnabled: boolean,
  requestEmail: string,
  chatEnabled: boolean,
  chatEmail: string,
}

export function defaultDoctorsOfficeEmailNotifications(): DoctorsOfficeEmailNotifications {
  return {
    requestEnabled: false,
    requestEmail: '',
    chatEnabled: false,
    chatEmail: '',
  }
}

export const temporaryNotificationKeys = [
  'profile',
  'appointments',
  'prescriptions',
  'referrals',
] as const

export type TemporaryNotificationKey = typeof temporaryNotificationKeys[number]

export type TemporaryNotificationTile = {
  enabled: boolean,
  title: string,
  description: string,
}

export type DoctorsOfficeTemporaryNotifications = Record<
  TemporaryNotificationKey,
  TemporaryNotificationTile
>

export function defaultTemporaryNotificationTile(): TemporaryNotificationTile {
  return {
    enabled: false,
    title: '',
    description: '',
  }
}

export function defaultDoctorsOfficeTemporaryNotifications(): DoctorsOfficeTemporaryNotifications {
  return {
    profile: defaultTemporaryNotificationTile(),
    appointments: defaultTemporaryNotificationTile(),
    prescriptions: defaultTemporaryNotificationTile(),
    referrals: defaultTemporaryNotificationTile(),
  }
}

export function doctorsOfficeSpecializationIds(office: {
  specializationId: string,
  specializationIds?: string[],
}): string[] {
  if (office.specializationIds && office.specializationIds.length > 0) {
    return [...office.specializationIds]
  }
  return [office.specializationId]
}

export type DoctorsOffice = {
  id: string,
  name: string,
  specialization: string,
  specializationIds: string[],
  imageUri?: string,
  phoneNumber?: string,
  faxNumber?: string,
  websiteUrl?: string,
  openingHours: DoctorsOfficeOpeningHours,
  openingHoursNote: string,
  address: Address,
  onlineServices: DoctorsOfficeOnlineServices,
  emailNotifications: DoctorsOfficeEmailNotifications,
  temporaryNotifications: DoctorsOfficeTemporaryNotifications,
  services: DoctorService[],
  offers: DoctorService[],
  doctors: Doctor[],
}

export type UpdateDoctorsOfficeInput = {
  name?: string,
  imageUri?: string,
  phoneNumber?: string,
  faxNumber?: string,
  websiteUrl?: string,
  openingHours?: DoctorsOfficeOpeningHours,
  openingHoursNote?: string,
  address?: Address,
  specializationIds?: string[],
  onlineServices?: DoctorsOfficeOnlineServices,
  emailNotifications?: DoctorsOfficeEmailNotifications,
  temporaryNotifications?: DoctorsOfficeTemporaryNotifications,
  services?: UpdateDoctorsOfficeServiceInput[],
}

export function isMyDoctorsOffice(
  myDoctors: MyDoctors,
  doctorsOfficeId: string
): boolean {
  return myDoctors.doctorIds.includes(doctorsOfficeId)
}
