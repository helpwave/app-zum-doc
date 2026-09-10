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
  description: string,
}

export type MyDoctors = {
  doctorIds: string[],
}

export const defaultPracticeOfficeId = 'office-moser'

export type DoctorsOffice = {
  id: string,
  name: string,
  specialization: string,
  imageUri?: string,
  phoneNumber?: string,
  websiteUrl?: string,
  openingHours: DoctorsOfficeOpeningHours,
  address: Address,
  services: DoctorService[],
  offers: DoctorService[],
  doctors: Doctor[],
}

export type UpdateDoctorsOfficeInput = {
  name?: string,
  phoneNumber?: string,
  websiteUrl?: string,
  openingHours?: DoctorsOfficeOpeningHours,
  address?: Address,
}

export function isMyDoctorsOffice(
  myDoctors: MyDoctors,
  doctorsOfficeId: string
): boolean {
  return myDoctors.doctorIds.includes(doctorsOfficeId)
}
