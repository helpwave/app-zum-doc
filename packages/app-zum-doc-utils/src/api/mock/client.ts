import {
  appointmentsSeed,
  citiesSeed,
  conversationsSeed,
  doctorsOfficesSeed,
  initialMyDoctorIds,
  medicationCatalogSeed,
  messagesByConversation,
  patientMedicationsSeed,
  patientProfileSeed,
  patientProfilesSeed,
  practiceConversationsSeed,
  practiceMessagesByConversation,
  practicePatientsSeed,
  practiceTodayAppointmentsSeed,
  prescriptionsSeed,
  referralsSeed,
  specializationsSeed,
  type DoctorsOfficeSeed,
  type LocalizedDoctorSeed,
  type LocalizedDoctorServiceSeed,
  type LocalizedLabel,
  type LocalizedTemporaryNotificationTile,
  type LocalizedTemporaryNotifications
} from './data'
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
  type Prescription,
  type PrescriptionRecord,
  type Referral,
  type ReferralRecord,
  type RequestBase,
  type SearchCity,
  type SearchSpecialization,
  type StructuredCardMessage,
  type TextMessage,
  type UpdateDoctorsOfficeInput
} from '../types'
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
  type TemporaryNotificationKey,
  type TemporaryNotificationTile
} from '../doctorsOffice'
import { parseIsoDate } from '../openingHours'
import {
  canTransitionPatientRequestStatus,
  isOpenPatientRequestStatus
} from '../requests'

type HomeSummary = {
  myDoctors: DoctorsOffice[],
  recentRequests: RequestBase[],
}

const delayMs = 550

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function listedTodayAppointmentRecords(): AppointmentRecord[] {
  const date = isoDate(new Date())
  return practiceTodayAppointmentsSeed
    .filter((item) => item.listed !== false)
    .map((item): AppointmentRecord => {
      const record: AppointmentRecord = {
        id: item.id,
        profileId: item.profileId,
        time: item.time,
        note: item.note,
        isEmergency: false,
        status: item.status,
        doctorsOfficeId: defaultPracticeOfficeId,
        date,
      }
      if (item.sickNote) {
        record.sickNote = item.sickNote
      }
      return record
    })
}

function createAppointmentsState(): AppointmentRecord[] {
  return [
    ...structuredClone(appointmentsSeed),
    ...listedTodayAppointmentRecords(),
  ]
}

function ensureListedTodayAppointments(): void {
  const date = isoDate(new Date())
  const listed = listedTodayAppointmentRecords()
  const byId = new Map(appointmentsState.map((item) => [item.id, item]))
  const next = appointmentsState.map((item) => {
    if (!listed.some((today) => today.id === item.id)) {
      return item
    }
    return { ...item, date }
  })
  for (const record of listed) {
    if (!byId.has(record.id)) {
      next.push(record)
    }
  }
  appointmentsState = next
}

function resolvePracticePatient(profileId: string): PatientProfile | undefined {
  return practicePatientsState.find((item) => item.id === profileId)
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

let conversationsState: ConversationPreview[] = structuredClone(conversationsSeed)
let messagesState: Record<string, Message[]> = structuredClone(
  messagesByConversation
)
let myDoctorIds = new Set<string>(initialMyDoctorIds)
let patientMedicationsState: Medication[] = structuredClone(patientMedicationsSeed)
let appointmentsState: AppointmentRecord[] = createAppointmentsState()
let prescriptionsState: PrescriptionRecord[] = structuredClone(prescriptionsSeed)
let referralsState: ReferralRecord[] = structuredClone(referralsSeed)
let doctorsOfficesState: Record<string, DoctorsOfficeSeed> = structuredClone(doctorsOfficesSeed)
let practiceConversationsState: ConversationPreview[] = structuredClone(practiceConversationsSeed)
let practiceMessagesState: Record<string, Message[]> = structuredClone(
  practiceMessagesByConversation
)
let practicePatientsState: PatientProfile[] = structuredClone(practicePatientsSeed)
let blockedPracticePatientIds = new Set<string>()

export const mockApiConfig = {
  forceFail: false,
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function withMockLatency<T>(
  work: () => T,
  options?: { failKey?: string }
): Promise<T> {
  await sleep(delayMs)

  const shouldFail =
    mockApiConfig.forceFail ||
    options?.failKey?.toLowerCase() === 'fehler' ||
    process.env['EXPO_PUBLIC_MOCK_FAIL'] === '1'

  if (shouldFail) {
    throw new Error('Die Daten konnten nicht geladen werden. Bitte erneut versuchen.')
  }

  return work()
}

export async function fetchConversations(): Promise<ConversationPreview[]> {
  return withMockLatency(() =>
    conversationsState.map((conversation) => ({ ...conversation })))
}

export async function fetchConversation(params: {
  conversationId: string,
}): Promise<ConversationPreview> {
  return withMockLatency(() => {
    const conversation = conversationsState.find(
      (item) => item.id === params.conversationId
    )
    if (!conversation) {
      throw new Error('Unterhaltung nicht gefunden.')
    }
    return { ...conversation }
  })
}

export async function fetchMessages(params: {
  conversationId: string,
}): Promise<Message[]> {
  return withMockLatency(() => {
    const messages = messagesState[params.conversationId] ?? []
    return messages.map((message) => ({ ...message }))
  })
}

export async function markConversationRead(
  conversationId: string
): Promise<ConversationPreview[]> {
  return withMockLatency(() => {
    conversationsState = conversationsState.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      return { ...conversation, unreadCount: 0 }
    })
    return conversationsState.map((conversation) => ({ ...conversation }))
  })
}

export async function sendMessage(
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

    const existing = messagesState[conversationId] ?? []
    messagesState = {
      ...messagesState,
      [conversationId]: [...existing, message],
    }

    const lastMessage: MessagePreview = {
      id: message.id,
      preview: body,
      time: now,
      direction: 'outgoing',
      status: 'sent',
    }

    conversationsState = conversationsState.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      return {
        ...conversation,
        lastMessage,
        unreadCount: 0,
      }
    })

    return (messagesState[conversationId] ?? []).map((item) => ({ ...item }))
  })
}

export async function resolveCardAction(
  conversationId: string,
  messageId: string,
  actionId: string
): Promise<Message[]> {
  return withMockLatency(() => {
    const existing = messagesState[conversationId] ?? []
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

    messagesState = {
      ...messagesState,
      [conversationId]: next,
    }

    return next.map((message) => ({ ...message }))
  })
}

export async function fetchHomeSummary(params: { locale: AppLocale }): Promise<HomeSummary> {
  return withMockLatency(() => ({
    myDoctors: [...myDoctorIds].flatMap((id) => {
      const office = doctorsOfficesState[id]
      return office ? [toDoctorsOffice(office, params.locale)] : []
    }),
    recentRequests: buildRecentRequests(params.locale),
  }))
}

export async function fetchPatientProfile(): Promise<PatientProfile> {
  return withMockLatency(() => ({ ...patientProfileSeed }))
}

export async function fetchPatientProfileById(params: {
  profileId: string,
}): Promise<PatientProfile> {
  return withMockLatency(() => {
    const profile = resolvePracticePatient(params.profileId)
    if (profile) {
      return {
        ...profile,
        insurance: { ...profile.insurance },
        medicationList: profile.medicationList.map((item) => ({ ...item })),
      }
    }
    throw new Error('Profil nicht gefunden.')
  })
}

export async function fetchPracticePatients(): Promise<PracticePatient[]> {
  return withMockLatency(() => {
    ensureListedTodayAppointments()
    return practicePatientsState.map((profile) => toPracticePatient(profile))
  })
}

function clonePatientProfile(profile: PatientProfile): PatientProfile {
  return {
    ...profile,
    insurance: { ...profile.insurance },
    medicationList: profile.medicationList.map((item) => ({ ...item })),
  }
}

function lastVisitFor(profileId: string): Date | undefined {
  const dates: Date[] = []
  for (const appointment of appointmentsState) {
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
  const index = Math.max(0, practicePatientsState.findIndex((item) => item.id === profileId))
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
    blocked: blockedPracticePatientIds.has(profile.id),
  }
}

export async function createPracticePatient(
  input: CreatePracticePatientInput
): Promise<PracticePatient> {
  return withMockLatency(() => {
    const firstName = input.firstName.trim()
    const lastName = input.lastName.trim()
    if (!firstName || !lastName || !input.dateOfBirth) {
      throw new Error('Bitte Vorname, Nachname und Geburtsdatum angeben.')
    }
    const id = `patient-${Date.now()}`
    const insuranceNumber = String(51_247_32 + practicePatientsState.length)
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
    practicePatientsState = [profile, ...practicePatientsState]
    return toPracticePatient(profile)
  })
}

export async function deletePracticePatient(profileId: string): Promise<void> {
  return withMockLatency(() => {
    const exists = practicePatientsState.some((item) => item.id === profileId)
    if (!exists) {
      throw new Error('Profil nicht gefunden.')
    }
    practicePatientsState = practicePatientsState.filter((item) => item.id !== profileId)
    blockedPracticePatientIds.delete(profileId)
  })
}

export async function setPracticePatientBlocked(params: {
  profileId: string,
  blocked: boolean,
}): Promise<PracticePatient> {
  return withMockLatency(() => {
    const profile = resolvePracticePatient(params.profileId)
    if (!profile) {
      throw new Error('Profil nicht gefunden.')
    }
    if (params.blocked) {
      blockedPracticePatientIds.add(params.profileId)
    } else {
      blockedPracticePatientIds.delete(params.profileId)
    }
    return toPracticePatient(profile)
  })
}

export async function fetchPatientProfiles(): Promise<PatientProfileSummary[]> {
  return withMockLatency(() =>
    patientProfilesSeed.map((profile) => ({ ...profile })))
}

function resolveDoctorsOffice(
  doctorsOfficeId: string,
  locale: AppLocale
): DoctorsOffice {
  const office = doctorsOfficesState[doctorsOfficeId]
  if (!office) {
    throw new Error('Arztpraxis nicht gefunden.')
  }
  return toDoctorsOffice(office, locale)
}

function buildRecentRequests(locale: AppLocale): PatientRequest[] {
  return [
    ...prescriptionsState.map((record) => toPrescription(record, locale)),
    ...referralsState.map((record) => toReferral(record, locale)),
    ...appointmentsState.map((record) => toAppointment(record, locale)),
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

export async function fetchAppointment(
  appointmentId: string,
  locale: AppLocale
): Promise<Appointment> {
  return withMockLatency(() => {
    const appointment = appointmentsState.find((item) => item.id === appointmentId)
    if (!appointment) {
      throw new Error('Termin nicht gefunden.')
    }
    return toAppointment(appointment, locale)
  })
}

export async function createAppointment(
  input: CreateAppointmentInput,
  locale: AppLocale
): Promise<Appointment> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[input.doctorsOfficeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    const profile =
      patientProfilesSeed.find((item) => item.id === input.profileId)
      ?? patientProfilesSeed[0]
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
    appointmentsState = [appointment, ...appointmentsState]
    return toAppointment(appointment, locale)
  })
}

export async function cancelAppointment(
  appointmentId: string,
  locale: AppLocale
): Promise<Appointment> {
  return withMockLatency(() => {
    const existing = appointmentsState.find((item) => item.id === appointmentId)
    if (!existing) {
      throw new Error('Termin nicht gefunden.')
    }
    const appointment: AppointmentRecord = {
      ...existing,
      status: 'cancelled',
    }
    appointmentsState = appointmentsState.map((item) =>
      item.id === appointmentId ? appointment : item)
    return toAppointment(appointment, locale)
  })
}

export async function fetchPrescription(params: {
  id: string,
  locale: AppLocale,
}): Promise<Prescription> {
  return withMockLatency(() => {
    const prescription = prescriptionsState.find((item) => item.id === params.id)
    if (!prescription) {
      throw new Error('Rezept nicht gefunden.')
    }
    return toPrescription(prescription, params.locale)
  })
}

export async function createPrescription(
  input: CreatePrescriptionInput,
  locale: AppLocale
): Promise<Prescription> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[input.doctorsOfficeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    const profile =
      patientProfilesSeed.find((item) => item.id === input.profileId)
      ?? patientProfilesSeed[0]
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
    prescriptionsState = [prescription, ...prescriptionsState]
    return toPrescription(prescription, locale)
  })
}

export async function cancelPrescription(
  prescriptionId: string,
  locale: AppLocale
): Promise<Prescription> {
  return withMockLatency(() => {
    const existing = prescriptionsState.find((item) => item.id === prescriptionId)
    if (!existing) {
      throw new Error('Rezept nicht gefunden.')
    }
    const prescription: PrescriptionRecord = {
      ...existing,
      status: 'cancelled',
    }
    prescriptionsState = prescriptionsState.map((item) =>
      item.id === prescriptionId ? prescription : item)
    return toPrescription(prescription, locale)
  })
}

export async function fetchReferral(params: {
  id: string,
  locale: AppLocale,
}): Promise<Referral> {
  return withMockLatency(() => {
    const referral = referralsState.find((item) => item.id === params.id)
    if (!referral) {
      throw new Error('Überweisung nicht gefunden.')
    }
    return toReferral(referral, params.locale)
  })
}

export async function createReferral(
  input: CreateReferralInput,
  locale: AppLocale
): Promise<Referral> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[input.doctorsOfficeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    const profile =
      patientProfilesSeed.find((item) => item.id === input.profileId)
      ?? patientProfilesSeed[0]
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
    referralsState = [referral, ...referralsState]
    return toReferral(referral, locale)
  })
}

export async function cancelReferral(
  referralId: string,
  locale: AppLocale
): Promise<Referral> {
  return withMockLatency(() => {
    const existing = referralsState.find((item) => item.id === referralId)
    if (!existing) {
      throw new Error('Überweisung nicht gefunden.')
    }
    const referral: ReferralRecord = {
      ...existing,
      status: 'cancelled',
    }
    referralsState = referralsState.map((item) =>
      item.id === referralId ? referral : item)
    return toReferral(referral, locale)
  })
}

export async function fetchPatientMedications(): Promise<Medication[]> {
  return withMockLatency(() =>
    patientMedicationsState.map((medication) => ({ ...medication })))
}

export async function searchMedications(params: {
  search?: string,
}): Promise<MedicationCatalogItem[]> {
  return withMockLatency(() => {
    const query = params.search?.trim().toLowerCase() ?? ''
    return medicationCatalogSeed
      .filter((item) => !query || matchesQuery(item.name, query))
      .map((item) => ({ ...item }))
  }, { failKey: params.search })
}

export async function addPatientMedication(params: {
  catalogId: string,
  size: MedicationSize,
}): Promise<Medication[]> {
  return withMockLatency(() => {
    const catalogItem = medicationCatalogSeed.find(
      (item) => item.id === params.catalogId
    )
    if (!catalogItem) {
      throw new Error('Medikament nicht gefunden.')
    }

    const alreadyAdded = patientMedicationsState.some(
      (medication) =>
        medication.name === catalogItem.name && medication.size === params.size
    )
    if (!alreadyAdded) {
      patientMedicationsState = [
        ...patientMedicationsState,
        {
          id: `med-${catalogItem.id}-${params.size}-${Date.now()}`,
          name: catalogItem.name,
          size: params.size,
        },
      ]
    }

    return patientMedicationsState.map((medication) => ({ ...medication }))
  })
}

export async function removePatientMedication(
  medicationId: string
): Promise<Medication[]> {
  return withMockLatency(() => {
    patientMedicationsState = patientMedicationsState.filter(
      (medication) => medication.id !== medicationId
    )
    return patientMedicationsState.map((medication) => ({ ...medication }))
  })
}

function localizedSpecialty(office: DoctorsOfficeSeed, locale: AppLocale): string {
  const fromIds = doctorsOfficeSpecializationIds(office)
    .map((id) => specializationsSeed.find((item) => item.id === id)?.labels[locale])
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

export async function fetchMyDoctors(): Promise<MyDoctors> {
  return withMockLatency(() => ({
    doctorIds: [...myDoctorIds],
  }))
}

export async function fetchDoctorsOffice(params: {
  id: string,
  locale: AppLocale,
}): Promise<DoctorsOffice> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[params.id]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    return toDoctorsOffice(office, params.locale)
  })
}

export async function addMyDoctor(doctorsOfficeId: string): Promise<MyDoctors> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[doctorsOfficeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    myDoctorIds.add(office.id)
    return { doctorIds: [...myDoctorIds] }
  })
}

export async function removeMyDoctor(doctorsOfficeId: string): Promise<MyDoctors> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[doctorsOfficeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    myDoctorIds.delete(office.id)
    return { doctorIds: [...myDoctorIds] }
  })
}

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query)
}

export async function fetchCities(params: {
  search?: string,
  locale: AppLocale,
}): Promise<SearchCity[]> {
  return withMockLatency(() => {
    const query = params.search?.trim().toLowerCase() ?? ''
    return citiesSeed
      .map((city) => ({
        id: city.id,
        label: city.labels[params.locale],
      }))
      .filter((city) => !query || matchesQuery(city.label, query))
  }, { failKey: params.search })
}

export async function fetchSpecializations(params: {
  search?: string,
  locale: AppLocale,
}): Promise<SearchSpecialization[]> {
  return withMockLatency(() => {
    const query = params.search?.trim().toLowerCase() ?? ''
    return specializationsSeed
      .map((specialization) => ({
        id: specialization.id,
        label: specialization.labels[params.locale],
      }))
      .filter((specialization) => !query || matchesQuery(specialization.label, query))
  }, { failKey: params.search })
}

export async function fetchDoctors(
  filters: DoctorSearchFilters
): Promise<DoctorsOffice[]> {
  return withMockLatency(() => {
    const query = filters.query?.trim().toLowerCase() ?? ''
    const cityById = new Map(citiesSeed.map((city) => [city.id, city]))

    return Object.values(doctorsOfficesState)
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
  const practicePatient = resolvePracticePatient(profileId)
  if (practicePatient) {
    return toPatientProfileSummary(practicePatient)
  }
  const summary = patientProfilesSeed.find((item) => item.id === profileId)
  if (summary) {
    return { ...summary }
  }
  return toPatientProfileSummary(patientProfileSeed)
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

export async function fetchPracticeOverview(params: {
  officeId: string,
  locale: AppLocale,
}): Promise<PracticeOverview> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[params.officeId]
    if (!office) {
      throw new Error('Arztpraxis nicht gefunden.')
    }
    ensureListedTodayAppointments()
    const requests = practiceRequestsForOffice(params.officeId, params.locale)
    const open = requests.filter((request) =>
      isOpenPatientRequestStatus(request.status))
    const today = isoDate(new Date())
    const todayStart = startOfToday()
    let todayAppointmentsGkv = 0
    let todayAppointmentsPkv = 0
    let sickNotes = 0
    let openAppointmentsWithoutSickNote = 0

    for (const seed of practiceTodayAppointmentsSeed) {
      const patient = resolvePracticePatient(seed.profileId) ?? patientProfileSeed
      const company = findInsuranceCompany(patient.insurance.insuranceProviderId)
      if (company?.type === 'private') {
        todayAppointmentsPkv += 1
      } else {
        todayAppointmentsGkv += 1
      }
      if (seed.sickNote) {
        sickNotes += 1
      } else {
        openAppointmentsWithoutSickNote += 1
      }
    }

    const todayAppointments = appointmentsState
      .filter((item) => (
        item.doctorsOfficeId === params.officeId
        && item.date === today
      ))
      .sort((left, right) => left.time.localeCompare(right.time))
      .map((item) => {
        const patient = resolvePracticePatient(item.profileId) ?? patientProfileSeed
        return {
          id: item.id,
          time: item.time,
          date: item.date,
          patientName: patientProfileFullName(patient),
          insuranceLabel: formatInsuranceChipLabel(patient.insurance),
          reason: item.note,
        }
      })

    const unreadChatCount = practiceConversationsState.reduce(
      (sum, conversation) => sum + conversation.unreadCount,
      0
    )
    const overdueMessageCount = practiceConversationsState.filter((conversation) => (
      conversation.unreadCount > 0
      && conversation.lastMessage.time < todayStart
    )).length

    const recentMessages = [...practiceConversationsState]
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
      patientCount: practicePatientsState.length,
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

export async function fetchPracticeRequests(params: {
  officeId: string,
  locale: AppLocale,
  kind?: PatientRequestType,
  status?: PatientRequestStatus,
}): Promise<PracticeRequest[]> {
  return withMockLatency(() => {
    ensureListedTodayAppointments()
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

export async function fetchPracticeRequest(params: {
  id: string,
  locale: AppLocale,
}): Promise<PracticeRequest> {
  return withMockLatency(() => {
    const appointment = appointmentsState.find((item) => item.id === params.id)
    if (appointment) {
      return toPracticeRequest(toAppointment(appointment, params.locale))
    }
    const prescription = prescriptionsState.find((item) => item.id === params.id)
    if (prescription) {
      return toPracticeRequest(toPrescription(prescription, params.locale))
    }
    const referral = referralsState.find((item) => item.id === params.id)
    if (referral) {
      return toPracticeRequest(toReferral(referral, params.locale))
    }
    throw new Error('Anfrage nicht gefunden.')
  })
}

export async function updatePatientRequestStatus(params: {
  id: string,
  kind: PatientRequestType,
  status: PatientRequestStatus,
  locale: AppLocale,
}): Promise<PracticeRequest> {
  return withMockLatency(() => {
    if (params.kind === 'appointment') {
      const existing = appointmentsState.find((item) => item.id === params.id)
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
      appointmentsState = appointmentsState.map((item) =>
        item.id === params.id ? appointment : item)
      return toPracticeRequest(toAppointment(appointment, params.locale))
    }

    if (params.kind === 'prescription') {
      const existing = prescriptionsState.find((item) => item.id === params.id)
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
      prescriptionsState = prescriptionsState.map((item) =>
        item.id === params.id ? prescription : item)
      return toPracticeRequest(toPrescription(prescription, params.locale))
    }

    const existing = referralsState.find((item) => item.id === params.id)
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
    referralsState = referralsState.map((item) =>
      item.id === params.id ? referral : item)
    return toPracticeRequest(toReferral(referral, params.locale))
  })
}

export async function updateDoctorsOffice(params: {
  officeId: string,
  locale: AppLocale,
  input: UpdateDoctorsOfficeInput,
}): Promise<DoctorsOffice> {
  return withMockLatency(() => {
    const office = doctorsOfficesState[params.officeId]
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
    doctorsOfficesState = {
      ...doctorsOfficesState,
      [params.officeId]: next,
    }
    return toDoctorsOffice(next, params.locale)
  })
}

export async function fetchPracticeConversations(): Promise<ConversationPreview[]> {
  return withMockLatency(() =>
    practiceConversationsState.map((conversation) => ({ ...conversation })))
}

export async function fetchPracticeConversation(params: {
  conversationId: string,
}): Promise<ConversationPreview> {
  return withMockLatency(() => {
    const conversation = practiceConversationsState.find(
      (item) => item.id === params.conversationId
    )
    if (!conversation) {
      throw new Error('Unterhaltung nicht gefunden.')
    }
    return { ...conversation }
  })
}

export async function fetchPracticeMessages(params: {
  conversationId: string,
}): Promise<Message[]> {
  return withMockLatency(() => {
    const messages = practiceMessagesState[params.conversationId] ?? []
    return messages.map((message) => ({ ...message }))
  })
}

export async function markPracticeConversationRead(
  conversationId: string
): Promise<ConversationPreview[]> {
  return withMockLatency(() => {
    practiceConversationsState = practiceConversationsState.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      return { ...conversation, unreadCount: 0 }
    })
    return practiceConversationsState.map((conversation) => ({ ...conversation }))
  })
}

export async function sendPracticeMessage(
  conversationId: string,
  body: string
): Promise<Message[]> {
  return withMockLatency(() => {
    const conversation = practiceConversationsState.find(
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

    const existing = practiceMessagesState[conversationId] ?? []
    practiceMessagesState = {
      ...practiceMessagesState,
      [conversationId]: [...existing, message],
    }

    const lastMessage: MessagePreview = {
      id: message.id,
      preview: body,
      time: now,
      direction: 'outgoing',
      status: 'sent',
    }

    practiceConversationsState = practiceConversationsState.map((item) => {
      if (item.id !== conversationId) {
        return item
      }
      return {
        ...item,
        lastMessage,
        unreadCount: 0,
      }
    })

    return (practiceMessagesState[conversationId] ?? []).map((item) => ({ ...item }))
  })
}

export function resetMockStore(): void {
  conversationsState = structuredClone(conversationsSeed)
  messagesState = structuredClone(messagesByConversation)
  myDoctorIds = new Set<string>(initialMyDoctorIds)
  patientMedicationsState = structuredClone(patientMedicationsSeed)
  appointmentsState = createAppointmentsState()
  prescriptionsState = structuredClone(prescriptionsSeed)
  referralsState = structuredClone(referralsSeed)
  doctorsOfficesState = structuredClone(doctorsOfficesSeed)
  practiceConversationsState = structuredClone(practiceConversationsSeed)
  practiceMessagesState = structuredClone(practiceMessagesByConversation)
  practicePatientsState = structuredClone(practicePatientsSeed)
  blockedPracticePatientIds = new Set<string>()
}
