import type { ApiClient } from '../client'
import {
  type DoctorsOfficeSeed,
  type LocalizedDoctorSeed,
  type LocalizedDoctorServiceSeed,
  type LocalizedLabel,
  type LocalizedTemporaryNotificationTile,
  type LocalizedTemporaryNotifications
} from './data'
import { mockStore as store, resetMockStore, type MockPracticeAccount } from './store'
import { type BackupData, type ProfileJson } from '../backup'
import type { AppOnboardingProfileInput, CompleteAppOnboardingInput, OnboardingInformation } from '../appOnboarding'
import {
  WeekdayUtils,
  type Appointment,
  type AppointmentRecord,
  type AppLocale,
  type ConversationPreview,
  type CreateAppointmentInput,
  type CreatePrescriptionInput,
  type CreateReferralInput,
  type DoctorSearchFilters,
  type DoctorsOffice,
  type DoctorsOfficeOpeningHours,
  type Medication,
  type MedicationCatalogItem,
  type MedicationSize,
  type Message,
  type MessagePreview,
  type MyDoctors,
  type PatientProfile,
  type PatientProfileSummary,
  type PatientRequest,
  type PatientRequestStatus,
  type PatientRequestType,
  type PracticeOverview,
  type PracticePatient,
  type PracticeRequest,
  type CreatePracticePatientInput,
  type CreatePatientProfileInput,
  type Prescription,
  type PrescriptionRecord,
  type Referral,
  type ReferralRecord,
  type SearchCity,
  type SearchSpecialization,
  type StructuredCardMessage,
  type TextMessage,
  type UpdateDoctorsOfficeInput,
  type CompletePracticeOnboardingInput,
  type EncryptionKeyTest,
  type PracticeEncryptionData,
  type PracticeMyData,
  type PracticeOnboardingStatus,
  type HomeSummary
} from '../types'
import {
  base64ToArrayBuffer,
  encryptWithPublicKey,
  encryptionTestPlaintext
} from '../encryption'
import {
  formatAppointmentRequestTitle,
  formatPrescriptionRequestTitle,
  formatReferralRequestTitle
} from '../requestTitle'
import {
  formatInsuranceChipLabel,
  findInsuranceCompany
} from '../insurance'
import {
  patientProfileFullName,
  toPatientProfileSummary
} from '../patientProfile'
import {
  defaultDoctorsOfficeEmailNotifications,
  defaultDoctorsOfficeOnlineServices,
  defaultDoctorsOfficeTemporaryNotifications,
  defaultPracticeOfficeId,
  doctorsOfficeSpecializationIds,
  temporaryNotificationKeys,
  type DoctorsOfficeEmailNotifications,
  type DoctorsOfficeOnlineServices,
  type DoctorsOfficeTemporaryNotifications,
  type TemporaryNotificationTile
} from '../doctorsOffice'
import { parseIsoDate } from '../openingHours'
import {
  canTransitionPatientRequestStatus,
  isOpenPatientRequestStatus
} from '../requests'

export type MockApiClient = ApiClient & {
  reset: () => void,
  setForceFail: (value: boolean) => void,
}

export type CreateMockApiClientOptions = {
  forceFail?: boolean,
  delayMs?: number,
}

export function createMockApiClient(
  options: CreateMockApiClientOptions = {}
): MockApiClient {
  const delayMs = options.delayMs ?? 550

  function isoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }

  function resolvePracticePatient(profileId: string): PatientProfile | undefined {
    return store.practicePatients.find((item) => item.id === profileId)
  }

  function startOfToday(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  function householdProfiles(): PatientProfile[] {
    return store.mainProfile == null
      ? store.managedProfiles
      : [store.mainProfile, ...store.managedProfiles]
  }

  function findHouseholdProfile(profileId: string): PatientProfile | undefined {
    return householdProfiles().find((profile) => profile.id === profileId)
  }

  function currentProfile(): PatientProfile | null {
    return store.mainProfile
  }

  function upsertProfile(profile: PatientProfile): PatientProfile {
    const next = clonePatientProfile(profile)
    if (store.mainProfile?.id === next.id) {
      store.mainProfile = next
      return next
    }
    const index = store.managedProfiles.findIndex((item) => item.id === next.id)
    if (index >= 0) {
      store.managedProfiles[index] = next
    } else {
      store.managedProfiles = [...store.managedProfiles, next]
    }
    return store.managedProfiles.find((item) => item.id === next.id) ?? next
  }

  function toSpkiBase64(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return null
    }
    const pemMatch = trimmed.match(/-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/)
    if (pemMatch?.[1]) {
      const body = pemMatch[1].replace(/\s+/g, '')
      return body.length > 0 ? body : null
    }
    try {
      base64ToArrayBuffer(trimmed)
      return trimmed
    } catch {
      return null
    }
  }

  function writePracticeAccount(next: MockPracticeAccount): void {
    store.practiceAccount = next
  }

  let forceFail = options.forceFail === true

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  async function withMockLatency<T>(
    work: () => T,
    latencyOptions?: { failKey?: string }
  ): Promise<T> {
    await sleep(delayMs)

    const shouldFail =
      forceFail ||
      latencyOptions?.failKey?.toLowerCase() === 'fehler'

    if (shouldFail) {
      throw new Error('Die Daten konnten nicht geladen werden. Bitte erneut versuchen.')
    }

    return work()
  }

  async function fetchConversations(): Promise<ConversationPreview[]> {
    return withMockLatency(() =>
      store.conversations.map((conversation) => ({ ...conversation })))
  }

  async function fetchConversation(params: {
    conversationId: string,
  }): Promise<ConversationPreview> {
    return withMockLatency(() => {
      const conversation = store.conversations.find(
        (item) => item.id === params.conversationId
      )
      if (!conversation) {
        throw new Error('Unterhaltung nicht gefunden.')
      }
      return { ...conversation }
    })
  }

  async function fetchMessages(params: {
    conversationId: string,
  }): Promise<Message[]> {
    return withMockLatency(() => {
      const messages = store.messages[params.conversationId] ?? []
      return messages.map((message) => ({ ...message }))
    })
  }

  async function markConversationRead(
    conversationId: string
  ): Promise<ConversationPreview[]> {
    return withMockLatency(() => {
      store.conversations = store.conversations.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }
        return { ...conversation, unreadCount: 0 }
      })
      return store.conversations.map((conversation) => ({ ...conversation }))
    })
  }

  async function sendMessage(
    conversationId: string,
    body: string
  ): Promise<Message[]> {
    return withMockLatency(() => {
      const now = new Date()
      const message: TextMessage = {
        id: `msg-local-${Date.now()}`,
        type: 'text',
        direction: 'outgoing',
        status: 'sent',
        body,
        time: now,
      }

      const existing = store.messages[conversationId] ?? []
      store.messages = {
        ...store.messages,
        [conversationId]: [...existing, message],
      }

      const lastMessage: MessagePreview = {
        id: message.id,
        preview: body,
        time: now,
        direction: 'outgoing',
        status: 'sent',
      }

      store.conversations = store.conversations.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }
        return {
          ...conversation,
          lastMessage,
          unreadCount: 0,
        }
      })

      return (store.messages[conversationId] ?? []).map((item) => ({ ...item }))
    })
  }

  async function resolveCardAction(
    conversationId: string,
    messageId: string,
    actionId: string
  ): Promise<Message[]> {
    return withMockLatency(() => {
      const existing = store.messages[conversationId] ?? []
      const next: Message[] = existing.map((message) => {
        if (message.id !== messageId || message.type !== 'card') {
          return message
        }

        const card = message as StructuredCardMessage
        return {
          ...card,
          selectedActionId: actionId,
          actions: undefined,
        }
      })

      if (actionId === 'accept') {
        next.push({
          id: `msg-system-${Date.now()}`,
          type: 'system',
          body: 'Termin bestätigt · Mi. 8. Juli 2026 · 15:00 Uhr',
        })
      }

      store.messages = {
        ...store.messages,
        [conversationId]: next,
      }

      return next.map((message) => ({ ...message }))
    })
  }

  async function fetchHomeSummary(params: { locale: AppLocale }): Promise<HomeSummary> {
    return withMockLatency(() => ({
      myDoctors: [...store.myDoctorIds].flatMap((id) => {
        const office = store.doctorsOffices[id]
        return office ? [toDoctorsOffice(office, params.locale)] : []
      }),
      recentRequests: buildRecentRequests(params.locale),
    }))
  }

  async function fetchPatientProfile(): Promise<PatientProfile | null> {
    return withMockLatency(() => {
      const profile = currentProfile()
      return profile == null ? null : clonePatientProfile(profile)
    })
  }

  function patientProfileFromBackup(profile: ProfileJson): PatientProfile {
    const dateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth)
      ? parseIsoDate(profile.dateOfBirth)
      : new Date(profile.dateOfBirth)
    if (Number.isNaN(dateOfBirth.getTime())) {
      throw new Error('Invalid backup payload')
    }
    return {
      id: profile.id == null
        ? `imported-${profile.firstName}-${profile.lastName}-${profile.dateOfBirth}`
        : String(profile.id),
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth,
      email: '',
      phone: profile.phoneNumber,
      insurance: {
        insuranceProviderId: profile.insurance,
        insuranceNumber: profile.insuranceNumber,
      },
      medicationList: profile.medications.map((item, index) => ({
        id: `imported-medication-${profile.id ?? 'new'}-${index + 1}`,
        name: item.name,
        size: item.packageSize === 'n1' || item.packageSize === 'n2' || item.packageSize === 'n3'
          ? item.packageSize
          : 'n1',
      })),
    }
  }

  async function importPatientBackup(payload: BackupData): Promise<PatientProfile> {
    return withMockLatency(() => {
      if (payload.profile.length === 0) {
        throw new Error('Invalid backup payload')
      }
      const imported = payload.profile.map((profile) => patientProfileFromBackup(profile))
      for (const profile of imported) {
        if (store.mainProfile == null) {
          store.mainProfile = profile
          continue
        }
        upsertProfile(profile)
      }
      const current = currentProfile()
      if (current == null) {
        throw new Error('Invalid backup payload')
      }
      return clonePatientProfile(current)
    })
  }

  async function fetchPatientProfileById(params: {
    profileId: string,
  }): Promise<PatientProfile> {
    return withMockLatency(() => {
      const household = findHouseholdProfile(params.profileId)
      if (household) {
        return clonePatientProfile(household)
      }
      const profile = resolvePracticePatient(params.profileId)
      if (profile) {
        return clonePatientProfile(profile)
      }
      throw new Error('Profil nicht gefunden.')
    })
  }

  async function fetchPracticePatients(): Promise<PracticePatient[]> {
    return withMockLatency(() => (
      store.practicePatients.map((profile) => toPracticePatient(profile))
    ))
  }

  function clonePatientProfile(profile: PatientProfile): PatientProfile {
    return {
      ...profile,
      insurance: { ...profile.insurance },
      medicationList: profile.medicationList.map((item) => ({ ...item })),
    }
  }

  function syncCurrentProfileToHousehold() {
    const profile = currentProfile()
    if (profile == null) {
      return
    }
    upsertProfile(profile)
  }

  function lastVisitFor(profileId: string): Date | undefined {
    const dates: Date[] = []
    for (const appointment of store.appointments) {
      if (appointment.profileId !== profileId || appointment.status === 'cancelled') {
        continue
      }
      const date = parseIsoDate(appointment.date)
      const [hoursText, minutesText] = appointment.time.split(':')
      date.setHours(Number(hoursText ?? 0), Number(minutesText ?? 0), 0, 0)
      dates.push(date)
    }
    dates.sort((left, right) => right.getTime() - left.getTime())
    return dates[0]
  }

  function fallbackLastVisit(profileId: string): Date {
    const index = Math.max(0, store.practicePatients.findIndex((item) => item.id === profileId))
    return new Date(2025, 3, 24 + index, 8, 33)
  }

  function toPracticePatient(profile: PatientProfile): PracticePatient {
    const lastVisit = lastVisitFor(profile.id) ?? fallbackLastVisit(profile.id)
    return {
      ...clonePatientProfile(profile),
      lastVisit,
      lastChangedAt: lastVisit,
      lastChangedBy: 'Max Mustermann',
      insuranceCardCurrent: true,
      blocked: store.blockedPracticePatientIds.includes(profile.id),
    }
  }

  async function createPracticePatient(
    input: CreatePracticePatientInput
  ): Promise<PracticePatient> {
    return withMockLatency(() => {
      const firstName = input.firstName.trim()
      const lastName = input.lastName.trim()
      if (!firstName || !lastName || !input.dateOfBirth) {
        throw new Error('Bitte Vorname, Nachname und Geburtsdatum angeben.')
      }
      const id = `patient-${Date.now()}`
      const insuranceNumber = String(51_247_32 + store.practicePatients.length)
      const profile: PatientProfile = {
        id,
        firstName,
        lastName,
        dateOfBirth: parseIsoDate(input.dateOfBirth),
        email: `${firstName}.${lastName}@mail.de`.toLowerCase().replaceAll(' ', ''),
        phone: '',
        insurance: {
          insuranceProviderId: 'techniker-krankenkasse',
          insuranceNumber,
        },
        medicationList: [],
      }
      store.practicePatients = [profile, ...store.practicePatients]
      return toPracticePatient(profile)
    })
  }

  async function deletePracticePatient(profileId: string): Promise<void> {
    return withMockLatency(() => {
      const exists = store.practicePatients.some((item) => item.id === profileId)
      if (!exists) {
        throw new Error('Profil nicht gefunden.')
      }
      store.practicePatients = store.practicePatients.filter((item) => item.id !== profileId)
      store.blockedPracticePatientIds = store.blockedPracticePatientIds.filter(
        (id) => id !== profileId
      )
    })
  }

  async function setPracticePatientBlocked(params: {
    profileId: string,
    blocked: boolean,
  }): Promise<PracticePatient> {
    return withMockLatency(() => {
      const profile = resolvePracticePatient(params.profileId)
      if (!profile) {
        throw new Error('Profil nicht gefunden.')
      }
      if (params.blocked) {
        if (!store.blockedPracticePatientIds.includes(params.profileId)) {
          store.blockedPracticePatientIds = [
            ...store.blockedPracticePatientIds,
            params.profileId,
          ]
        }
      } else {
        store.blockedPracticePatientIds = store.blockedPracticePatientIds.filter(
          (id) => id !== params.profileId
        )
      }
      return toPracticePatient(profile)
    })
  }

  async function fetchPatientProfiles(): Promise<PatientProfileSummary[]> {
    return withMockLatency(() => householdProfiles().map((profile) => toPatientProfileSummary(profile)))
  }

  async function selectPatientProfile(params: {
    profileId: string,
  }): Promise<PatientProfile> {
    return withMockLatency(() => {
      const next = findHouseholdProfile(params.profileId)
      if (next == null) {
        throw new Error('Profil nicht gefunden.')
      }
      syncCurrentProfileToHousehold()
      applyHouseholdProfileAsCurrent(next)
      return clonePatientProfile(next)
    })
  }

  function applyHouseholdProfileAsCurrent(profile: PatientProfile | null) {
    if (profile == null) {
      store.mainProfile = null
      return
    }
    const stored = clonePatientProfile(profile)
    const previousMain = store.mainProfile
    store.managedProfiles = store.managedProfiles.filter((item) => item.id !== stored.id)
    if (previousMain != null && previousMain.id !== stored.id) {
      store.managedProfiles = [
        clonePatientProfile(previousMain),
        ...store.managedProfiles.filter((item) => item.id !== previousMain.id),
      ]
    }
    store.mainProfile = stored
  }

  async function createPatientProfile(
    input: CreatePatientProfileInput,
  ): Promise<PatientProfile> {
    return withMockLatency(() => {
      const firstName = input.firstName.trim()
      const lastName = input.lastName.trim()
      if (!firstName || !lastName || !input.dateOfBirth) {
        throw new Error('Bitte Vorname, Nachname und Geburtsdatum angeben.')
      }
      const profile: PatientProfile = {
        id: `patient-${Date.now()}`,
        firstName,
        lastName,
        dateOfBirth: parseIsoDate(input.dateOfBirth),
        email: "",
        phone: "",
        insurance: {
          insuranceProviderId: "",
          insuranceNumber: "",
        },
        medicationList: [],
      }
      if (store.mainProfile == null) {
        store.mainProfile = profile
      } else {
        store.managedProfiles = [...store.managedProfiles, profile]
      }
      return clonePatientProfile(profile)
    })
  }

  async function deletePatientProfile(profileId: string): Promise<PatientProfile | null> {
    return withMockLatency(() => {
      const isMain = store.mainProfile?.id === profileId
      const isManaged = store.managedProfiles.some((item) => item.id === profileId)
      if (!isMain && !isManaged) {
        throw new Error('Profil nicht gefunden.')
      }
      if (isMain) {
        const [nextMain, ...remaining] = store.managedProfiles
        store.mainProfile = nextMain ?? null
        store.managedProfiles = remaining
      } else {
        store.managedProfiles = store.managedProfiles.filter((item) => item.id !== profileId)
      }
      const current = currentProfile()
      return current == null ? null : clonePatientProfile(current)
    })
  }

  function resolveDoctorsOffice(
    doctorsOfficeId: string,
    locale: AppLocale
  ): DoctorsOffice {
    const office = store.doctorsOffices[doctorsOfficeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    return toDoctorsOffice(office, locale)
  }

  function buildRecentRequests(locale: AppLocale): PatientRequest[] {
    return [
      ...store.prescriptions.map((record) => toPrescription(record, locale)),
      ...store.referrals.map((record) => toReferral(record, locale)),
      ...store.appointments.map((record) => toAppointment(record, locale)),
    ]
  }

  function toAppointment(
    record: AppointmentRecord,
    locale: AppLocale
  ): Appointment {
    const { doctorsOfficeId, ...rest } = record
    return {
      ...rest,
      kind: 'appointment',
      title: formatAppointmentRequestTitle(record.date, record.time, locale),
      doctorsOffice: resolveDoctorsOffice(doctorsOfficeId, locale),
    }
  }

  function toPrescription(
    record: PrescriptionRecord,
    locale: AppLocale
  ): Prescription {
    const { doctorsOfficeId, ...rest } = record
    const medicationNames = record.medications.map((medication) => medication.name)
    return {
      ...rest,
      kind: 'prescription',
      title: formatPrescriptionRequestTitle(medicationNames),
      doctorsOffice: resolveDoctorsOffice(doctorsOfficeId, locale),
      medications: rest.medications.map((medication) => ({ ...medication })),
    }
  }

  function toReferral(record: ReferralRecord, locale: AppLocale): Referral {
    const { doctorsOfficeId, ...rest } = record
    return {
      ...rest,
      kind: 'referral',
      title: formatReferralRequestTitle(record.specialization),
      doctorsOffice: resolveDoctorsOffice(doctorsOfficeId, locale),
    }
  }

  async function fetchAppointment(
    appointmentId: string,
    locale: AppLocale
  ): Promise<Appointment> {
    return withMockLatency(() => {
      const appointment = store.appointments.find((item) => item.id === appointmentId)
      if (!appointment) {
        throw new Error('Termin nicht gefunden.')
      }
      return toAppointment(appointment, locale)
    })
  }

  async function createAppointment(
    input: CreateAppointmentInput,
    locale: AppLocale
  ): Promise<Appointment> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[input.doctorsOfficeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      const profile =
        findHouseholdProfile(input.profileId)
        ?? householdProfiles()[0]
      if (!profile) {
        throw new Error('Profil nicht gefunden.')
      }

      const appointment: AppointmentRecord = {
        id: `req-appointment-${Date.now()}`,
        doctorsOfficeId: office.id,
        profileId: profile.id,
        date: input.date,
        time: input.time,
        isEmergency: input.isEmergency,
        note: input.note,
        status: 'requested',
      }
      store.appointments = [appointment, ...store.appointments]
      return toAppointment(appointment, locale)
    })
  }

  async function cancelAppointment(
    appointmentId: string,
    locale: AppLocale
  ): Promise<Appointment> {
    return withMockLatency(() => {
      const existing = store.appointments.find((item) => item.id === appointmentId)
      if (!existing) {
        throw new Error('Termin nicht gefunden.')
      }
      const appointment: AppointmentRecord = {
        ...existing,
        status: 'cancelled',
      }
      store.appointments = store.appointments.map((item) =>
        item.id === appointmentId ? appointment : item)
      return toAppointment(appointment, locale)
    })
  }

  async function fetchPrescription(params: {
    id: string,
    locale: AppLocale,
  }): Promise<Prescription> {
    return withMockLatency(() => {
      const prescription = store.prescriptions.find((item) => item.id === params.id)
      if (!prescription) {
        throw new Error('Rezept nicht gefunden.')
      }
      return toPrescription(prescription, params.locale)
    })
  }

  async function createPrescription(
    input: CreatePrescriptionInput,
    locale: AppLocale
  ): Promise<Prescription> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[input.doctorsOfficeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      const profile =
        findHouseholdProfile(input.profileId)
        ?? householdProfiles()[0]
      if (!profile) {
        throw new Error('Profil nicht gefunden.')
      }
      if (input.medications.length === 0) {
        throw new Error('Bitte fügen Sie mindestens ein Medikament hinzu.')
      }

      const prescription: PrescriptionRecord = {
        id: `req-prescription-${Date.now()}`,
        doctorsOfficeId: office.id,
        profileId: profile.id,
        shipByMail: input.shipByMail,
        note: input.note,
        medications: input.medications.map((medication, index) => ({
          id: `rx-med-${Date.now()}-${index}`,
          name: medication.name,
          size: medication.size,
        })),
        status: 'inProgress',
      }
      store.prescriptions = [prescription, ...store.prescriptions]
      return toPrescription(prescription, locale)
    })
  }

  async function cancelPrescription(
    prescriptionId: string,
    locale: AppLocale
  ): Promise<Prescription> {
    return withMockLatency(() => {
      const existing = store.prescriptions.find((item) => item.id === prescriptionId)
      if (!existing) {
        throw new Error('Rezept nicht gefunden.')
      }
      const prescription: PrescriptionRecord = {
        ...existing,
        status: 'cancelled',
      }
      store.prescriptions = store.prescriptions.map((item) =>
        item.id === prescriptionId ? prescription : item)
      return toPrescription(prescription, locale)
    })
  }

  async function fetchReferral(params: {
    id: string,
    locale: AppLocale,
  }): Promise<Referral> {
    return withMockLatency(() => {
      const referral = store.referrals.find((item) => item.id === params.id)
      if (!referral) {
        throw new Error('Überweisung nicht gefunden.')
      }
      return toReferral(referral, params.locale)
    })
  }

  async function createReferral(
    input: CreateReferralInput,
    locale: AppLocale
  ): Promise<Referral> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[input.doctorsOfficeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      const profile =
        findHouseholdProfile(input.profileId)
        ?? householdProfiles()[0]
      if (!profile) {
        throw new Error('Profil nicht gefunden.')
      }
      if (input.specialization.trim().length === 0) {
        throw new Error('Bitte wählen Sie eine Fachrichtung aus.')
      }

      const referral: ReferralRecord = {
        id: `req-referral-${Date.now()}`,
        doctorsOfficeId: office.id,
        profileId: profile.id,
        specialization: input.specialization.trim(),
        reason: input.reason,
        status: 'inProgress',
      }
      store.referrals = [referral, ...store.referrals]
      return toReferral(referral, locale)
    })
  }

  async function cancelReferral(
    referralId: string,
    locale: AppLocale
  ): Promise<Referral> {
    return withMockLatency(() => {
      const existing = store.referrals.find((item) => item.id === referralId)
      if (!existing) {
        throw new Error('Überweisung nicht gefunden.')
      }
      const referral: ReferralRecord = {
        ...existing,
        status: 'cancelled',
      }
      store.referrals = store.referrals.map((item) =>
        item.id === referralId ? referral : item)
      return toReferral(referral, locale)
    })
  }

  async function fetchPatientMedications(): Promise<Medication[]> {
    return withMockLatency(() => {
      const profile = currentProfile()
      if (profile == null) {
        return []
      }
      return profile.medicationList.map((medication) => ({ ...medication }))
    })
  }

  async function searchMedications(params: {
    search?: string,
  }): Promise<MedicationCatalogItem[]> {
    return withMockLatency(() => {
      const query = params.search?.trim().toLowerCase() ?? ''
      return store.medicationCatalog
        .filter((item) => !query || matchesQuery(item.name, query))
        .map((item) => ({ ...item }))
    }, { failKey: params.search })
  }

  async function addPatientMedication(params: {
    catalogId: string,
    size: MedicationSize,
  }): Promise<Medication[]> {
    return withMockLatency(() => {
      const catalogItem = store.medicationCatalog.find(
        (item) => item.id === params.catalogId
      )
      if (!catalogItem) {
        throw new Error('Medikament nicht gefunden.')
      }

      const profile = currentProfile()
      if (profile == null) {
        throw new Error('Profil nicht gefunden.')
      }
      const alreadyAdded = profile.medicationList.some(
        (medication) =>
          medication.name === catalogItem.name && medication.size === params.size
      )
      if (!alreadyAdded) {
        profile.medicationList = [
          ...profile.medicationList,
          {
            id: `med-${catalogItem.id}-${params.size}-${Date.now()}`,
            name: catalogItem.name,
            size: params.size,
          },
        ]
      }
      return profile.medicationList.map((medication) => ({ ...medication }))
    })
  }

  async function removePatientMedication(
    medicationId: string
  ): Promise<Medication[]> {
    return withMockLatency(() => {
      const profile = currentProfile()
      if (profile == null) {
        return []
      }
      profile.medicationList = profile.medicationList.filter(
        (medication) => medication.id !== medicationId
      )
      return profile.medicationList.map((medication) => ({ ...medication }))
    })
  }

  function localizedSpecialty(office: DoctorsOfficeSeed, locale: AppLocale): string {
    const fromIds = doctorsOfficeSpecializationIds(office)
      .map((id) => store.specializations.find((item) => item.id === id)?.labels[locale])
      .filter((label): label is string => Boolean(label))
      .join(' - ')
    if (fromIds.length > 0) {
      return fromIds
    }
    return office.specialization?.[locale] ?? ''
  }

  function officeTemporaryNotificationTile(
    tile: LocalizedTemporaryNotificationTile | undefined,
    locale: AppLocale
  ): TemporaryNotificationTile {
    return {
      enabled: tile?.enabled ?? false,
      title: tile?.title?.[locale] ?? '',
      description: tile?.description?.[locale] ?? '',
    }
  }

  function officeTemporaryNotifications(
    office: DoctorsOfficeSeed,
    locale: AppLocale
  ): DoctorsOfficeTemporaryNotifications {
    const stored = office.temporaryNotifications ?? {}
    return temporaryNotificationKeys.reduce((next, key) => {
      next[key] = officeTemporaryNotificationTile(stored[key], locale)
      return next
    }, defaultDoctorsOfficeTemporaryNotifications())
  }

  function setTemporaryNotificationTile(
    existing: LocalizedTemporaryNotificationTile | undefined,
    locale: AppLocale,
    next: TemporaryNotificationTile
  ): LocalizedTemporaryNotificationTile {
    return {
      enabled: next.enabled,
      title: setOptionalLocalizedLabel(existing?.title, locale, next.title),
      description: setOptionalLocalizedLabel(existing?.description, locale, next.description),
    }
  }

  function setTemporaryNotifications(
    existing: LocalizedTemporaryNotifications | undefined,
    locale: AppLocale,
    next: DoctorsOfficeTemporaryNotifications
  ): LocalizedTemporaryNotifications {
    return temporaryNotificationKeys.reduce((tiles, key) => {
      tiles[key] = setTemporaryNotificationTile(existing?.[key], locale, next[key])
      return tiles
    }, {} as LocalizedTemporaryNotifications)
  }

  function officeEmailNotifications(
    office: DoctorsOfficeSeed
  ): DoctorsOfficeEmailNotifications {
    return {
      ...defaultDoctorsOfficeEmailNotifications(),
      ...(office.emailNotifications ?? {}),
    }
  }

  function officeOnlineServices(
    office: DoctorsOfficeSeed
  ): DoctorsOfficeOnlineServices {
    return {
      ...defaultDoctorsOfficeOnlineServices(),
      ...(office.onlineServices ?? {}),
    }
  }

  function setLocalizedLabel(
    existing: LocalizedLabel | undefined,
    locale: AppLocale,
    value: string
  ): LocalizedLabel {
    return {
      'de-DE': locale === 'de-DE' ? value : (existing?.['de-DE'] ?? value),
      'en-US': locale === 'en-US' ? value : (existing?.['en-US'] ?? value),
    }
  }

  function setOptionalLocalizedLabel(
    existing: LocalizedLabel | undefined,
    locale: AppLocale,
    value: string | undefined
  ): LocalizedLabel | undefined {
    const trimmed = value?.trim() ?? ''
    if (!existing && trimmed.length === 0) {
      return undefined
    }
    const next = setLocalizedLabel(existing, locale, trimmed)
    if (next['de-DE'].trim().length === 0 && next['en-US'].trim().length === 0) {
      return undefined
    }
    return next
  }

  function localizedDoctorServices(
    services: LocalizedDoctorServiceSeed[],
    locale: AppLocale
  ) {
    return services.map((service) => {
      const description = service.description?.[locale]?.trim() ?? ''
      const url = service.url?.trim() ?? ''
      return {
        id: service.id,
        name: service.name[locale],
        ...(description.length > 0 ? { description } : {}),
        ...(url.length > 0 ? { url } : {}),
      }
    })
  }

  function localizedDoctors(
    doctors: LocalizedDoctorSeed[],
    locale: AppLocale
  ) {
    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name[locale],
      imageUri: doctor.imageUri,
    }))
  }

  function cloneOpeningHours(
    hours: DoctorsOfficeOpeningHours
  ): DoctorsOfficeOpeningHours {
    return WeekdayUtils.array.reduce((next, day) => {
      next[day] = [...(hours[day] ?? [])]
      return next
    }, {} as DoctorsOfficeOpeningHours)
  }

  function toDoctorsOffice(
    office: DoctorsOfficeSeed,
    locale: AppLocale
  ): DoctorsOffice {
    return {
      id: office.id,
      name: office.name,
      specialization: localizedSpecialty(office, locale),
      specializationIds: doctorsOfficeSpecializationIds(office),
      phoneNumber: office.phoneNumber,
      faxNumber: office.faxNumber,
      ...(office.imageUri ? { imageUri: office.imageUri } : {}),
      services: localizedDoctorServices(office.services ?? [], locale),
      offers: localizedDoctorServices(office.offers ?? [], locale),
      doctors: localizedDoctors(
        office.doctors ?? [
          {
            id: `${office.id}-doctor`,
            name: { 'de-DE': office.name, 'en-US': office.name },
            imageUri: office.imageUri ?? undefined,
          },
        ],
        locale
      ),
      address: { ...office.address },
      websiteUrl: office.websiteUrl,
      openingHours: cloneOpeningHours(office.openingHours),
      openingHoursNote: office.openingHoursNote?.[locale] ?? '',
      onlineServices: officeOnlineServices(office),
      emailNotifications: officeEmailNotifications(office),
      temporaryNotifications: officeTemporaryNotifications(office, locale),
    }
  }

  async function fetchMyDoctors(): Promise<MyDoctors> {
    return withMockLatency(() => ({
      doctorIds: [...store.myDoctorIds],
    }))
  }

  async function fetchDoctorsOffice(params: {
    id: string,
    locale: AppLocale,
  }): Promise<DoctorsOffice> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[params.id]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      return toDoctorsOffice(office, params.locale)
    })
  }

  async function addMyDoctor(doctorsOfficeId: string): Promise<MyDoctors> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[doctorsOfficeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      if (!store.myDoctorIds.includes(office.id)) {
        store.myDoctorIds = [...store.myDoctorIds, office.id]
      }
      return { doctorIds: [...store.myDoctorIds] }
    })
  }

  async function removeMyDoctor(doctorsOfficeId: string): Promise<MyDoctors> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[doctorsOfficeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      store.myDoctorIds = store.myDoctorIds.filter((id) => id !== office.id)
      return { doctorIds: [...store.myDoctorIds] }
    })
  }

  function matchesQuery(haystack: string, query: string): boolean {
    return haystack.toLowerCase().includes(query)
  }

  async function fetchCities(params: {
    search?: string,
    locale: AppLocale,
  }): Promise<SearchCity[]> {
    return withMockLatency(() => {
      const query = params.search?.trim().toLowerCase() ?? ''
      return store.cities
        .map((city) => ({
          id: city.id,
          label: city.labels[params.locale],
        }))
        .filter((city) => !query || matchesQuery(city.label, query))
    }, { failKey: params.search })
  }

  async function fetchSpecializations(params: {
    search?: string,
    locale: AppLocale,
  }): Promise<SearchSpecialization[]> {
    return withMockLatency(() => {
      const query = params.search?.trim().toLowerCase() ?? ''
      return store.specializations
        .map((specialization) => ({
          id: specialization.id,
          label: specialization.labels[params.locale],
        }))
        .filter((specialization) => !query || matchesQuery(specialization.label, query))
    }, { failKey: params.search })
  }

  async function fetchDoctors(
    filters: DoctorSearchFilters
  ): Promise<DoctorsOffice[]> {
    return withMockLatency(() => {
      const query = filters.query?.trim().toLowerCase() ?? ''
      const cityById = new Map(store.cities.map((city) => [city.id, city]))

      return Object.values(store.doctorsOffices)
        .filter((office) => {
          if (filters.cityId && office.cityId !== filters.cityId) {
            return false
          }
          if (
            filters.specializationId
            && !doctorsOfficeSpecializationIds(office).includes(filters.specializationId)
          ) {
            return false
          }

          if (!query) {
            return true
          }

          const cityLabel = cityById.get(office.cityId)?.labels[filters.locale] ?? ''
          const specializationLabel = localizedSpecialty(office, filters.locale)
          const haystack = `${office.name} ${specializationLabel} ${cityLabel}`
          return matchesQuery(haystack, query)
        })
        .map((office) => toDoctorsOffice(office, filters.locale))
    }, { failKey: filters.query })
  }

  function resolvePatientSummary(profileId: string): PatientProfileSummary {
    const profile = resolvePracticePatient(profileId)
      ?? findHouseholdProfile(profileId)
    if (profile) {
      return toPatientProfileSummary(profile)
    }
    return {
      id: profileId,
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(0),
      insurance: {
        insuranceProviderId: '',
        insuranceNumber: '',
      },
      medicationCount: 0,
    }
  }

  function toPracticeRequest(request: PatientRequest): PracticeRequest {
    return {
      ...request,
      patient: resolvePatientSummary(request.profileId),
    }
  }

  function practiceRequestsForOffice(
    officeId: string,
    locale: AppLocale
  ): PracticeRequest[] {
    return buildRecentRequests(locale)
      .filter((request) => request.doctorsOffice.id === officeId)
      .map(toPracticeRequest)
  }

  async function fetchPracticeOverview(params: {
    officeId: string,
    locale: AppLocale,
  }): Promise<PracticeOverview> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[params.officeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      const requests = practiceRequestsForOffice(params.officeId, params.locale)
      const open = requests.filter((request) =>
        isOpenPatientRequestStatus(request.status))
      const today = isoDate(new Date())
      const todayStart = startOfToday()
      let todayAppointmentsGkv = 0
      let todayAppointmentsPkv = 0
      let sickNotes = 0
      let openAppointmentsWithoutSickNote = 0

      for (const item of store.appointments) {
        if (
          item.doctorsOfficeId !== params.officeId
          || item.date !== today
          || item.status === 'cancelled'
        ) {
          continue
        }
        const patient = resolvePracticePatient(item.profileId)
          ?? findHouseholdProfile(item.profileId)
        const company = patient == null
          ? undefined
          : findInsuranceCompany(patient.insurance.insuranceProviderId)
        if (company?.type === 'private') {
          todayAppointmentsPkv += 1
        } else {
          todayAppointmentsGkv += 1
        }
        if (item.sickNote) {
          sickNotes += 1
        } else {
          openAppointmentsWithoutSickNote += 1
        }
      }

      const todayAppointments = store.appointments
        .filter((item) => (
          item.doctorsOfficeId === params.officeId
          && item.date === today
        ))
        .sort((left, right) => left.time.localeCompare(right.time))
        .map((item) => {
          const patient = resolvePracticePatient(item.profileId)
            ?? findHouseholdProfile(item.profileId)
          return {
            id: item.id,
            time: item.time,
            date: item.date,
            patientName: patient == null ? '' : patientProfileFullName(patient),
            insuranceLabel: patient == null ? '' : formatInsuranceChipLabel(patient.insurance),
            reason: item.note,
          }
        })

      const unreadChatCount = store.practiceConversations.reduce(
        (sum, conversation) => sum + conversation.unreadCount,
        0
      )
      const overdueMessageCount = store.practiceConversations.filter((conversation) => (
        conversation.unreadCount > 0
        && conversation.lastMessage.time < todayStart
      )).length

      const recentMessages = [...store.practiceConversations]
        .sort((left, right) =>
          right.lastMessage.time.getTime() - left.lastMessage.time.getTime())
        .slice(0, 6)
        .map((conversation) => {
          const patient = resolvePracticePatient(conversation.user.id)
          return {
            conversationId: conversation.id,
            patientName: conversation.user.name,
            insuranceLabel: patient
              ? formatInsuranceChipLabel(patient.insurance)
              : '',
            preview: conversation.lastMessage.preview,
            time: conversation.lastMessage.time,
          }
        })

      return {
        office: toDoctorsOffice(office, params.locale),
        requestCount: requests.length,
        openAppointments: open.filter((request) => request.kind === 'appointment').length,
        openPrescriptions: open.filter((request) => request.kind === 'prescription').length,
        openReferrals: open.filter((request) => request.kind === 'referral').length,
        patientCount: store.practicePatients.length,
        overdueMessageCount,
        unreadChatCount,
        todayAppointmentsGkv,
        todayAppointmentsPkv,
        requestDistribution: {
          sickNotes,
          referrals: open.filter((request) => request.kind === 'referral').length,
          appointments: openAppointmentsWithoutSickNote,
        },
        todayAppointments,
        recentMessages,
        recentRequests: requests.slice(0, 5),
      }
    })
  }

  async function fetchPracticeRequests(params: {
    officeId: string,
    locale: AppLocale,
    kind?: PatientRequestType,
    status?: PatientRequestStatus,
  }): Promise<PracticeRequest[]> {
    return withMockLatency(() => {
      return practiceRequestsForOffice(params.officeId, params.locale).filter((request) => {
        if (params.kind && request.kind !== params.kind) {
          return false
        }
        if (params.status && request.status !== params.status) {
          return false
        }
        return true
      })
    })
  }

  async function fetchPracticeRequest(params: {
    id: string,
    locale: AppLocale,
  }): Promise<PracticeRequest> {
    return withMockLatency(() => {
      const appointment = store.appointments.find((item) => item.id === params.id)
      if (appointment) {
        return toPracticeRequest(toAppointment(appointment, params.locale))
      }
      const prescription = store.prescriptions.find((item) => item.id === params.id)
      if (prescription) {
        return toPracticeRequest(toPrescription(prescription, params.locale))
      }
      const referral = store.referrals.find((item) => item.id === params.id)
      if (referral) {
        return toPracticeRequest(toReferral(referral, params.locale))
      }
      throw new Error('Anfrage nicht gefunden.')
    })
  }

  async function updatePatientRequestStatus(params: {
    id: string,
    kind: PatientRequestType,
    status: PatientRequestStatus,
    locale: AppLocale,
  }): Promise<PracticeRequest> {
    return withMockLatency(() => {
      if (params.kind === 'appointment') {
        const existing = store.appointments.find((item) => item.id === params.id)
        if (!existing) {
          throw new Error('Termin nicht gefunden.')
        }
        if (!canTransitionPatientRequestStatus('appointment', existing.status, params.status)) {
          throw new Error('Dieser Statuswechsel ist nicht möglich.')
        }
        const appointment: AppointmentRecord = {
          ...existing,
          status: params.status,
        }
        store.appointments = store.appointments.map((item) =>
          item.id === params.id ? appointment : item)
        return toPracticeRequest(toAppointment(appointment, params.locale))
      }

      if (params.kind === 'prescription') {
        const existing = store.prescriptions.find((item) => item.id === params.id)
        if (!existing) {
          throw new Error('Rezept nicht gefunden.')
        }
        if (!canTransitionPatientRequestStatus('prescription', existing.status, params.status)) {
          throw new Error('Dieser Statuswechsel ist nicht möglich.')
        }
        const prescription: PrescriptionRecord = {
          ...existing,
          status: params.status,
        }
        store.prescriptions = store.prescriptions.map((item) =>
          item.id === params.id ? prescription : item)
        return toPracticeRequest(toPrescription(prescription, params.locale))
      }

      const existing = store.referrals.find((item) => item.id === params.id)
      if (!existing) {
        throw new Error('Überweisung nicht gefunden.')
      }
      if (!canTransitionPatientRequestStatus('referral', existing.status, params.status)) {
        throw new Error('Dieser Statuswechsel ist nicht möglich.')
      }
      const referral: ReferralRecord = {
        ...existing,
        status: params.status,
      }
      store.referrals = store.referrals.map((item) =>
        item.id === params.id ? referral : item)
      return toPracticeRequest(toReferral(referral, params.locale))
    })
  }

  async function updateDoctorsOffice(params: {
    officeId: string,
    locale: AppLocale,
    input: UpdateDoctorsOfficeInput,
  }): Promise<DoctorsOffice> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[params.officeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      const specializationIds = params.input.specializationIds
        ? params.input.specializationIds.filter((id) => id.trim().length > 0)
        : doctorsOfficeSpecializationIds(office)
      const onlineServices = params.input.onlineServices
        ? {
          ...defaultDoctorsOfficeOnlineServices(),
          ...params.input.onlineServices,
          shipPrescriptionByMail: params.input.onlineServices.orderPrescriptions
            ? params.input.onlineServices.shipPrescriptionByMail
            : false,
        }
        : officeOnlineServices(office)
      const emailNotifications = params.input.emailNotifications
        ? {
          ...defaultDoctorsOfficeEmailNotifications(),
          ...params.input.emailNotifications,
        }
        : officeEmailNotifications(office)
      const temporaryNotifications = params.input.temporaryNotifications
        ? setTemporaryNotifications(
          office.temporaryNotifications,
          params.locale,
          params.input.temporaryNotifications
        )
        : office.temporaryNotifications
      const services = params.input.services
        ? params.input.services.map((service) => {
          const existing = (office.services ?? []).find((item) => item.id === service.id)
          return {
            id: service.id,
            name: setLocalizedLabel(existing?.name, params.locale, service.name),
            description: setOptionalLocalizedLabel(
              existing?.description,
              params.locale,
              service.description
            ),
            ...(service.url?.trim()
              ? { url: service.url.trim() }
              : {}),
          }
        })
        : office.services
      const next: DoctorsOfficeSeed = {
        ...office,
        name: params.input.name ?? office.name,
        imageUri: params.input.imageUri !== undefined
          ? (params.input.imageUri.trim() || undefined)
          : office.imageUri,
        phoneNumber: params.input.phoneNumber ?? office.phoneNumber,
        faxNumber: params.input.faxNumber ?? office.faxNumber,
        websiteUrl: params.input.websiteUrl ?? office.websiteUrl,
        address: params.input.address
          ? { ...params.input.address }
          : office.address,
        openingHours: params.input.openingHours
          ? cloneOpeningHours(params.input.openingHours)
          : office.openingHours,
        openingHoursNote: params.input.openingHoursNote !== undefined
          ? setLocalizedLabel(
            office.openingHoursNote,
            params.locale,
            params.input.openingHoursNote
          )
          : office.openingHoursNote,
        specializationId: specializationIds[0] ?? office.specializationId,
        specializationIds,
        onlineServices,
        emailNotifications,
        temporaryNotifications,
        services,
      }
      store.doctorsOffices = {
        ...store.doctorsOffices,
        [params.officeId]: next,
      }
      return toDoctorsOffice(next, params.locale)
    })
  }

  async function fetchPracticeOnboardingStatus(): Promise<PracticeOnboardingStatus> {
    return withMockLatency(() => ({
      hasDoctorsOffice: store.practiceAccount.hasDoctorsOffice,
      hasPublicKey: store.practiceAccount.publicKey != null,
    }))
  }

  async function fetchPracticeEncryptionData(): Promise<PracticeEncryptionData> {
    return withMockLatency(() => ({
      publicKey: store.practiceAccount.publicKey,
    }))
  }

  async function fetchPracticeMyData(): Promise<PracticeMyData> {
    return withMockLatency(() => {
      const office = store.doctorsOffices[defaultPracticeOfficeId]
      if (!office) {
        throw new Error('Arztpraxis nicht gefunden.')
      }
      return {
        name: office.name,
        address: { ...office.address },
      }
    })
  }

  async function uploadPracticePublicKey(publicKey: string): Promise<PracticeOnboardingStatus> {
    return withMockLatency(() => {
      const normalized = toSpkiBase64(publicKey)
      if (!normalized) {
        throw new Error('Ungültiger öffentlicher Schlüssel.')
      }
      writePracticeAccount({
        ...store.practiceAccount,
        publicKey: normalized,
      })
      return {
        hasDoctorsOffice: store.practiceAccount.hasDoctorsOffice,
        hasPublicKey: true,
      }
    })
  }

  async function fetchEncryptionKeyTest(): Promise<EncryptionKeyTest> {
    const publicKey = store.practiceAccount.publicKey
    if (!publicKey) {
      throw new Error('Kein öffentlicher Schlüssel vorhanden.')
    }
    await sleep(delayMs)
    const ciphertext = await encryptWithPublicKey(
      base64ToArrayBuffer(publicKey),
      encryptionTestPlaintext
    )
    if (forceFail) {
      throw new Error('Die Daten konnten nicht geladen werden. Bitte erneut versuchen.')
    }
    return { ciphertext }
  }

  async function completePracticeOnboarding(params: {
    locale: AppLocale,
    input: CompletePracticeOnboardingInput,
  }): Promise<DoctorsOffice> {
    const office = await updateDoctorsOffice({
      officeId: defaultPracticeOfficeId,
      locale: params.locale,
      input: {
        name: params.input.name,
        address: params.input.address,
        specializationIds: params.input.specializationIds,
      },
    })
    writePracticeAccount({
      ...store.practiceAccount,
      hasDoctorsOffice: true,
    })
    return office
  }

  async function fetchPracticeConversations(): Promise<ConversationPreview[]> {
    return withMockLatency(() =>
      store.practiceConversations.map((conversation) => ({ ...conversation })))
  }

  async function fetchPracticeConversation(params: {
    conversationId: string,
  }): Promise<ConversationPreview> {
    return withMockLatency(() => {
      const conversation = store.practiceConversations.find(
        (item) => item.id === params.conversationId
      )
      if (!conversation) {
        throw new Error('Unterhaltung nicht gefunden.')
      }
      return { ...conversation }
    })
  }

  async function fetchPracticeMessages(params: {
    conversationId: string,
  }): Promise<Message[]> {
    return withMockLatency(() => {
      const messages = store.practiceMessages[params.conversationId] ?? []
      return messages.map((message) => ({ ...message }))
    })
  }

  async function markPracticeConversationRead(
    conversationId: string
  ): Promise<ConversationPreview[]> {
    return withMockLatency(() => {
      store.practiceConversations = store.practiceConversations.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }
        return { ...conversation, unreadCount: 0 }
      })
      return store.practiceConversations.map((conversation) => ({ ...conversation }))
    })
  }

  async function sendPracticeMessage(
    conversationId: string,
    body: string
  ): Promise<Message[]> {
    return withMockLatency(() => {
      const conversation = store.practiceConversations.find(
        (item) => item.id === conversationId
      )
      if (!conversation) {
        throw new Error('Unterhaltung nicht gefunden.')
      }

      const now = new Date()
      const message: TextMessage = {
        id: `practice-msg-local-${Date.now()}`,
        type: 'text',
        direction: 'outgoing',
        status: 'sent',
        body,
        time: now,
      }

      const existing = store.practiceMessages[conversationId] ?? []
      store.practiceMessages = {
        ...store.practiceMessages,
        [conversationId]: [...existing, message],
      }

      const lastMessage: MessagePreview = {
        id: message.id,
        preview: body,
        time: now,
        direction: 'outgoing',
        status: 'sent',
      }

      store.practiceConversations = store.practiceConversations.map((item) => {
        if (item.id !== conversationId) {
          return item
        }
        return {
          ...item,
          lastMessage,
          unreadCount: 0,
        }
      })

      return (store.practiceMessages[conversationId] ?? []).map((item) => ({ ...item }))
    })
  }

  function onboardingInformation(): OnboardingInformation {
    return {
      mainProfile: store.mainProfile == null
        ? null
        : toPatientProfileSummary(store.mainProfile),
      managedProfiles: store.managedProfiles.map((profile) => toPatientProfileSummary(profile)),
      hasOnboarded: store.hasOnboarded,
    }
  }

  function profileFromOnboardingInput(profile: AppOnboardingProfileInput): PatientProfile {
    const dateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth)
      ? parseIsoDate(profile.dateOfBirth)
      : new Date(profile.dateOfBirth)
    if (Number.isNaN(dateOfBirth.getTime())) {
      throw new Error('Invalid onboarding profile')
    }
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth,
      email: profile.email,
      phone: profile.phoneNumber,
      insurance: {
        insuranceProviderId: profile.insurance,
        insuranceNumber: profile.insuranceNumber,
      },
      medicationList: profile.medications.map((item, index) => ({
        id: `onboarding-medication-${profile.id}-${index + 1}`,
        name: item.name,
        size: item.packageSize === 'n1' || item.packageSize === 'n2' || item.packageSize === 'n3'
          ? item.packageSize
          : 'n1',
      })),
    }
  }

  async function fetchOnboardingInformation(): Promise<OnboardingInformation> {
    return withMockLatency(() => onboardingInformation())
  }

  async function markAppOnboarded(): Promise<OnboardingInformation> {
    return withMockLatency(() => {
      if (currentProfile() == null) {
        throw new Error('Admin profile is missing')
      }
      store.hasOnboarded = true
      return onboardingInformation()
    })
  }

  async function completeAppOnboarding(
    input: CompleteAppOnboardingInput
  ): Promise<OnboardingInformation> {
    return withMockLatency(() => {
      store.mainProfile = profileFromOnboardingInput(input.mainProfile)
      store.managedProfiles = input.managedProfiles.map((profile) => profileFromOnboardingInput(profile))
      store.hasOnboarded = true
      return onboardingInformation()
    })
  }

  function reset(): void {
    resetMockStore()
  }

  return {
    fetchCities,
    fetchConversation,
    fetchConversations,
    fetchDoctors,
    fetchDoctorsOffice,
    fetchEncryptionKeyTest,
    fetchHomeSummary,
    fetchMyDoctors,
    fetchMessages,
    fetchAppointment,
    fetchPatientMedications,
    fetchPatientProfile,
    importPatientBackup,
    fetchPatientProfileById,
    fetchPatientProfiles,
    fetchOnboardingInformation,
    markAppOnboarded,
    completeAppOnboarding,
    selectPatientProfile,
    createPatientProfile,
    deletePatientProfile,
    fetchPracticeConversation,
    fetchPracticeConversations,
    fetchPracticeMessages,
    fetchPracticeEncryptionData,
    fetchPracticeMyData,
    fetchPracticeOnboardingStatus,
    fetchPracticeOverview,
    fetchPracticePatients,
    createPracticePatient,
    deletePracticePatient,
    setPracticePatientBlocked,
    fetchPracticeRequest,
    fetchPracticeRequests,
    fetchPrescription,
    fetchReferral,
    fetchSpecializations,
    markConversationRead,
    markPracticeConversationRead,
    resolveCardAction,
    searchMedications,
    sendMessage,
    sendPracticeMessage,
    addMyDoctor,
    addPatientMedication,
    cancelAppointment,
    cancelPrescription,
    cancelReferral,
    completePracticeOnboarding,
    createAppointment,
    createPrescription,
    createReferral,
    removeMyDoctor,
    removePatientMedication,
    updateDoctorsOffice,
    updatePatientRequestStatus,
    uploadPracticePublicKey,
    reset,
    setForceFail: (value: boolean) => {
      forceFail = value
    },
  }
}
