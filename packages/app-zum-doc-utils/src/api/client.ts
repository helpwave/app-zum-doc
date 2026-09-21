import type { DoctorsOffice, MyDoctors, UpdateDoctorsOfficeInput } from './doctorsOffice'
import type { AppLocale, MedicationSize, PatientRequestStatus, PatientRequestType } from './enums'
import type { Medication, MedicationCatalogItem } from './medication'
import type { ConversationPreview, Message } from './message'
import type { PatientProfile, PatientProfileSummary, PracticePatient, CreatePracticePatientInput } from './patientProfile'
import type {
  CompletePracticeOnboardingInput,
  EncryptionKeyTest,
  PracticeEncryptionData,
  PracticeMyData,
  PracticeOnboardingStatus
} from './practiceAccount'
import type {
  Appointment,
  CreateAppointmentInput,
  CreatePrescriptionInput,
  CreateReferralInput,
  HomeSummary,
  Prescription,
  Referral,
  PracticeOverview,
  PracticeRequest
} from './requests'
import type { DoctorSearchFilters, SearchCity, SearchSpecialization } from './search'

export type ApiClient = {
  fetchCities: (params: {
    search?: string,
    locale: AppLocale,
  }) => Promise<SearchCity[]>,
  fetchConversation: (params: {
    conversationId: string,
  }) => Promise<ConversationPreview>,
  fetchConversations: () => Promise<ConversationPreview[]>,
  fetchDoctors: (filters: DoctorSearchFilters) => Promise<DoctorsOffice[]>,
  fetchDoctorsOffice: (params: {
    id: string,
    locale: AppLocale,
  }) => Promise<DoctorsOffice>,
  fetchEncryptionKeyTest: () => Promise<EncryptionKeyTest>,
  fetchHomeSummary: (params: { locale: AppLocale }) => Promise<HomeSummary>,
  fetchMyDoctors: () => Promise<MyDoctors>,
  fetchMessages: (params: {
    conversationId: string,
  }) => Promise<Message[]>,
  fetchAppointment: (
    appointmentId: string,
    locale: AppLocale
  ) => Promise<Appointment>,
  fetchPatientMedications: () => Promise<Medication[]>,
  fetchPatientProfile: () => Promise<PatientProfile>,
  fetchPatientProfileById: (params: {
    profileId: string,
  }) => Promise<PatientProfile>,
  fetchPatientProfiles: () => Promise<PatientProfileSummary[]>,
  fetchPracticeConversation: (params: {
    conversationId: string,
  }) => Promise<ConversationPreview>,
  fetchPracticeConversations: () => Promise<ConversationPreview[]>,
  fetchPracticeMessages: (params: {
    conversationId: string,
  }) => Promise<Message[]>,
  fetchPracticeEncryptionData: () => Promise<PracticeEncryptionData>,
  fetchPracticeMyData: () => Promise<PracticeMyData>,
  fetchPracticeOnboardingStatus: () => Promise<PracticeOnboardingStatus>,
  fetchPracticeOverview: (params: {
    officeId: string,
    locale: AppLocale,
  }) => Promise<PracticeOverview>,
  fetchPracticePatients: () => Promise<PracticePatient[]>,
  createPracticePatient: (
    input: CreatePracticePatientInput
  ) => Promise<PracticePatient>,
  deletePracticePatient: (profileId: string) => Promise<void>,
  setPracticePatientBlocked: (params: {
    profileId: string,
    blocked: boolean,
  }) => Promise<PracticePatient>,
  fetchPracticeRequest: (params: {
    id: string,
    locale: AppLocale,
  }) => Promise<PracticeRequest>,
  fetchPracticeRequests: (params: {
    officeId: string,
    locale: AppLocale,
    kind?: PatientRequestType,
    status?: PatientRequestStatus,
  }) => Promise<PracticeRequest[]>,
  fetchPrescription: (params: {
    id: string,
    locale: AppLocale,
  }) => Promise<Prescription>,
  fetchReferral: (params: {
    id: string,
    locale: AppLocale,
  }) => Promise<Referral>,
  fetchSpecializations: (params: {
    search?: string,
    locale: AppLocale,
  }) => Promise<SearchSpecialization[]>,
  markConversationRead: (
    conversationId: string
  ) => Promise<ConversationPreview[]>,
  markPracticeConversationRead: (
    conversationId: string
  ) => Promise<ConversationPreview[]>,
  resolveCardAction: (
    conversationId: string,
    messageId: string,
    actionId: string
  ) => Promise<Message[]>,
  searchMedications: (params: {
    search?: string,
  }) => Promise<MedicationCatalogItem[]>,
  sendMessage: (
    conversationId: string,
    body: string
  ) => Promise<Message[]>,
  sendPracticeMessage: (
    conversationId: string,
    body: string
  ) => Promise<Message[]>,
  addMyDoctor: (doctorsOfficeId: string) => Promise<MyDoctors>,
  addPatientMedication: (params: {
    catalogId: string,
    size: MedicationSize,
  }) => Promise<Medication[]>,
  cancelAppointment: (
    appointmentId: string,
    locale: AppLocale
  ) => Promise<Appointment>,
  cancelPrescription: (
    prescriptionId: string,
    locale: AppLocale
  ) => Promise<Prescription>,
  cancelReferral: (
    referralId: string,
    locale: AppLocale
  ) => Promise<Referral>,
  completePracticeOnboarding: (params: {
    locale: AppLocale,
    input: CompletePracticeOnboardingInput,
  }) => Promise<DoctorsOffice>,
  createAppointment: (
    input: CreateAppointmentInput,
    locale: AppLocale
  ) => Promise<Appointment>,
  createPrescription: (
    input: CreatePrescriptionInput,
    locale: AppLocale
  ) => Promise<Prescription>,
  createReferral: (
    input: CreateReferralInput,
    locale: AppLocale
  ) => Promise<Referral>,
  removeMyDoctor: (doctorsOfficeId: string) => Promise<MyDoctors>,
  removePatientMedication: (medicationId: string) => Promise<Medication[]>,
  updateDoctorsOffice: (params: {
    officeId: string,
    locale: AppLocale,
    input: UpdateDoctorsOfficeInput,
  }) => Promise<DoctorsOffice>,
  updatePatientRequestStatus: (params: {
    id: string,
    kind: PatientRequestType,
    status: PatientRequestStatus,
    locale: AppLocale,
  }) => Promise<PracticeRequest>,
  uploadPracticePublicKey: (publicKey: string) => Promise<PracticeOnboardingStatus>,
}
