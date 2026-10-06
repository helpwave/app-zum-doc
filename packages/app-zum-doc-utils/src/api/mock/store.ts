import { insuranceCompanies, type InsuranceCompany } from '../insurance'
import type {
  AppointmentRecord,
  ConversationPreview,
  MedicationCatalogItem,
  Message,
  PatientProfile,
  PrescriptionRecord,
  ReferralRecord
} from '../types'
import {
  citiesSeed,
  doctorsOfficesSeed,
  medicationCatalogSeed,
  specializationsSeed,
  type DoctorsOfficeSeed,
  type LocalizedLabel
} from './data'

export type MockSearchCity = {
  id: string,
  labels: LocalizedLabel,
}

export type MockSearchSpecialization = {
  id: string,
  labels: LocalizedLabel,
}

export type MockPracticeAccount = {
  hasDoctorsOffice: boolean,
  publicKey: string | null,
}

export type MockStore = {
  insuranceCompanies: InsuranceCompany[],
  doctorsOffices: Record<string, DoctorsOfficeSeed>,
  cities: MockSearchCity[],
  specializations: MockSearchSpecialization[],
  medicationCatalog: MedicationCatalogItem[],
  myDoctorIds: string[],
  mainProfile: PatientProfile | null,
  managedProfiles: PatientProfile[],
  hasOnboarded: boolean,
  appointments: AppointmentRecord[],
  prescriptions: PrescriptionRecord[],
  referrals: ReferralRecord[],
  conversations: ConversationPreview[],
  messages: Record<string, Message[]>,
  practiceConversations: ConversationPreview[],
  practiceMessages: Record<string, Message[]>,
  practicePatients: PatientProfile[],
  blockedPracticePatientIds: string[],
  practiceAccount: MockPracticeAccount,
}

export function createInitialMockStore(): MockStore {
  return {
    insuranceCompanies,
    doctorsOffices: structuredClone(doctorsOfficesSeed),
    cities: structuredClone(citiesSeed),
    specializations: structuredClone(specializationsSeed),
    medicationCatalog: structuredClone(medicationCatalogSeed),
    myDoctorIds: [],
    mainProfile: null,
    managedProfiles: [],
    hasOnboarded: false,
    appointments: [],
    prescriptions: [],
    referrals: [],
    conversations: [],
    messages: {},
    practiceConversations: [],
    practiceMessages: {},
    practicePatients: [],
    blockedPracticePatientIds: [],
    practiceAccount: {
      hasDoctorsOffice: false,
      publicKey: null,
    },
  }
}

export const mockStore: MockStore = createInitialMockStore()

export function resetMockStore(): void {
  const next = createInitialMockStore()
  mockStore.insuranceCompanies = next.insuranceCompanies
  mockStore.doctorsOffices = next.doctorsOffices
  mockStore.cities = next.cities
  mockStore.specializations = next.specializations
  mockStore.medicationCatalog = next.medicationCatalog
  mockStore.myDoctorIds = next.myDoctorIds
  mockStore.mainProfile = next.mainProfile
  mockStore.managedProfiles = next.managedProfiles
  mockStore.hasOnboarded = next.hasOnboarded
  mockStore.appointments = next.appointments
  mockStore.prescriptions = next.prescriptions
  mockStore.referrals = next.referrals
  mockStore.conversations = next.conversations
  mockStore.messages = next.messages
  mockStore.practiceConversations = next.practiceConversations
  mockStore.practiceMessages = next.practiceMessages
  mockStore.practicePatients = next.practicePatients
  mockStore.blockedPracticePatientIds = next.blockedPracticePatientIds
  mockStore.practiceAccount = next.practiceAccount
}
